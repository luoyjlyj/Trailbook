import { serve } from '@hono/node-server';
import { createApp } from './app.ts';
import { readConfig } from './config.ts';

const config = readConfig();
const server = serve({ fetch: createApp(config.origins).fetch, port: config.port, hostname: config.hostname }, info => {
  console.log(`Trailbook API: http://${config.hostname}:${info.port}`);
  console.log('仅接收并校验需求；不记录请求正文、不保存数据、不生成行程。');
});
server.on('error', (error: NodeJS.ErrnoException) => {
  console.error(error.code === 'EADDRINUSE' ? `端口 ${config.port} 已被占用，请设置其他 PORT。` : `服务启动失败：${error.code ?? 'UNKNOWN'}`);
  process.exitCode = 1;
});
const shutdown = () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 3000).unref();
};
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
