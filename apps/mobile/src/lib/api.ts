import type { Draft, DraftErrors } from './travel';

export type ValidationResult = {
  status: 'validated';
  request: Draft;
  timezone: 'Asia/Shanghai';
  durationDays: number;
  persisted: false;
  itineraryGenerated: false;
};
export type ValidationReceipt = { inputKey: string; result: ValidationResult };
const fields = ['city', 'startDate', 'endDate', 'arrivalTime', 'departureTime', 'arrivalPlace', 'departurePlace', 'hotel', 'guide', 'pace', 'transport', 'needs'] as const;

export class RequestError extends Error {
  code: string;
  fields: DraftErrors;
  constructor(code: string, message: string, errors: DraftErrors = {}) {
    super(message);
    this.name = 'RequestError';
    this.code = code;
    this.fields = errors;
  }
}
function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }

export async function submitTravelRequest(draft: Draft, options: { signal?: AbortSignal; baseUrl?: string; timeoutMs?: number } = {}): Promise<ValidationResult> {
  const baseUrl = options.baseUrl ?? process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:3000';
  try {
    const url = new URL(baseUrl);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error();
  } catch { throw new RequestError('CONFIG_ERROR', '后端地址配置无效，请检查 EXPO_PUBLIC_API_URL。'); }

  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  if (options.signal?.aborted) abort();
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, options.timeoutMs ?? 10000);
  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/travel-requests/validate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft), signal: controller.signal,
    });
    if (response.status >= 500) throw new RequestError('SERVER_ERROR', '后端暂时无法处理请求，填写内容仍在，可以重试。');
    let body: unknown;
    try { body = await response.json(); }
    catch { throw new RequestError('INVALID_RESPONSE', '后端返回的内容无法识别，没有确认校验成功。'); }
    if (!response.ok) {
      if (record(body) && body.ok === false && record(body.error)) {
        const error = body.error;
        const errors: DraftErrors = {};
        if (record(error.fields)) {
          for (const key of [...fields, 'interests'] as const) {
            const value = error.fields[key];
            if (typeof value === 'string') errors[key] = value;
          }
        }
        throw new RequestError(typeof error.code === 'string' ? error.code : 'REQUEST_FAILED', typeof error.message === 'string' ? error.message : '提交未成功，请稍后重试。', errors);
      }
      throw new RequestError('REQUEST_FAILED', `提交失败（HTTP ${response.status}），填写内容仍在。`);
    }
    // Do not trust a 200 response alone, or associate a result with a different brief.
    const data = record(body) && body.ok === true && record(body.data) ? body.data : null;
    const request = data && record(data.request) ? data.request : null;
    if (!data || !request || data.status !== 'validated' || data.persisted !== false || data.itineraryGenerated !== false || data.timezone !== 'Asia/Shanghai'
      || !Number.isInteger(data.durationDays) || Number(data.durationDays) < 1 || Number(data.durationDays) > 7
      || data.durationDays !== (Date.parse(draft.endDate) - Date.parse(draft.startDate)) / 86400000 + 1
      || !fields.every(key => request[key] === draft[key].trim())
      || !Array.isArray(request.interests) || JSON.stringify(request.interests) !== JSON.stringify(draft.interests)) {
      throw new RequestError('INVALID_RESPONSE', '后端响应与本次需求不匹配，没有确认校验成功。');
    }
    return data as ValidationResult;
  } catch (error) {
    if (options.signal?.aborted) throw new RequestError('CANCELLED', '已取消本次提交。');
    if (timedOut) throw new RequestError('TIMEOUT', '等待后端超过 10 秒，填写内容仍在，请重试。');
    if (error instanceof RequestError) throw error;
    throw new RequestError('NETWORK_ERROR', '无法连接本地后端，请确认 apps/api 已启动，并检查接口地址和跨域配置后重试。');
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', abort);
  }
}
