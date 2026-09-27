export const defaultOrigins = ['http://localhost:8081', 'http://127.0.0.1:8081'];

export function readConfig(env: Record<string, string | undefined> = process.env) {
  const rawPort = env.PORT ?? '3000';
  if (!/^\d+$/.test(rawPort) || Number(rawPort) < 1 || Number(rawPort) > 65535) {
    throw new Error('PORT 必须是 1 至 65535 的整数。');
  }
  const origins = env.WEB_ORIGINS === undefined ? defaultOrigins : env.WEB_ORIGINS.split(',').map(value => value.trim()).filter(Boolean);
  if (!origins.length || origins.some(value => {
    try { const url = new URL(value); return !['http:', 'https:'].includes(url.protocol) || url.origin !== value; }
    catch { return true; }
  })) throw new Error('WEB_ORIGINS 必须是逗号分隔的完整 HTTP(S) origin，不能使用通配符、路径或凭据。');
  return { port: Number(rawPort), hostname: '127.0.0.1', origins };
}
