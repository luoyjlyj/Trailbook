import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { bodyLimit } from 'hono/body-limit';
import { dateValue, travelRequestSchema } from './schema.ts';
import { defaultOrigins } from './config.ts';

export function createApp(origins: string[] = defaultOrigins) {
  const app = new Hono();
  app.use('*', async (context, next) => {
    context.header('Cache-Control', 'no-store');
    context.header('X-Content-Type-Options', 'nosniff');
    const origin = context.req.header('Origin');
    if (origin && !origins.includes(origin)) {
      return context.json({ ok: false, error: { code: 'ORIGIN_NOT_ALLOWED', message: '此网页来源不在本地开发允许列表中。' } }, 403);
    }
    await next();
  });
  app.use('*', cors({ origin: origins, allowMethods: ['GET', 'POST', 'OPTIONS'], allowHeaders: ['Content-Type'], maxAge: 600 }));
  app.get('/health', context => context.json({ ok: true, service: 'trailbook-api', stage: 'validation-only' }));
  app.use('/travel-requests/validate', bodyLimit({
    maxSize: 16 * 1024,
    onError: context => context.json({ ok: false, error: { code: 'PAYLOAD_TOO_LARGE', message: '请求内容超过 16 KiB，请缩短后重试。' } }, 413),
  }));
  app.post('/travel-requests/validate', async context => {
    if (context.req.header('Content-Type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json') {
      return context.json({ ok: false, error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: '请使用 application/json 提交。' } }, 415);
    }
    let payload: unknown;
    try { payload = await context.req.json(); }
    catch { return context.json({ ok: false, error: { code: 'INVALID_JSON', message: '请求不是有效的 JSON。' } }, 400); }
    const result = travelRequestSchema.safeParse(payload);
    if (!result.success) {
      const fields: Record<string, string> = {};
      const formErrors: string[] = [];
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && key in travelRequestSchema.shape) fields[key] ??= issue.message;
        else formErrors.push('请求结构不正确或包含未支持的字段。');
      }
      return context.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: '出行信息未通过校验，请检查填写内容。', fields, formErrors: [...new Set(formErrors)] } }, 422);
    }
    const request = result.data;
    return context.json({
      ok: true,
      data: {
        status: 'validated',
        request,
        timezone: 'Asia/Shanghai',
        durationDays: (dateValue(request.endDate)! - dateValue(request.startDate)!) / 86400000 + 1,
        persisted: false,
        itineraryGenerated: false,
      },
    });
  });
  app.notFound(context => context.json({ ok: false, error: { code: 'NOT_FOUND', message: '接口不存在。' } }, 404));
  app.onError((_error, context) => context.json({ ok: false, error: { code: 'INTERNAL_ERROR', message: '服务暂时无法处理请求，请稍后重试。' } }, 500));
  return app;
}
