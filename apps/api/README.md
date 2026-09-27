# Trailbook 本地后端（第 1、2 步）

已实现 Node.js + Hono 启动入口、健康检查，以及 Zod 出行需求校验。前端已接入真实提交、字段错误、超时、取消和重试。**校验通过不代表保存，更不代表生成行程。**

没有数据库、Prisma、地图/天气/模型调用、账号或云同步。服务不记录请求正文，不持久化输入；返回需求摘要供前端确认。

## 启动

在 `apps/api` 中运行：

```powershell
npm start
```

默认监听 `http://127.0.0.1:3000`，仅本机可访问。开发时自动重启可用 `npm run dev`，Ctrl+C 停止。Node 24 原生运行可擦除类型语法的 TypeScript，不需要 tsx、ts-node 或全局工具。

依赖已安装无需重复安装；新检出项目执行 `npm ci`，使用该目录的锁文件。根目录没有 workspace，不在仓库根目录安装。

另开终端进入 `apps/mobile` 执行 `npm run web`，访问 `http://localhost:8081` 填写表单并点击“提交到后端校验”。不需要数据库或外部服务账号。

## 配置

默认值可直接使用，不必创建 `.env`。如需修改，参照 `.env.example` 在本目录创建本机 `.env`：

- `PORT`：默认 `3000`，必须为 1–65535；占用时报错，不擅自停止其他进程。
- `WEB_ORIGINS`：默认 `http://localhost:8081,http://127.0.0.1:8081`，严格匹配网页 origin，不带末尾斜杠。换前端端口时同步修改并重启 API。
- 前端可在 `apps/mobile/.env` 设置公开的 `EXPO_PUBLIC_API_URL`，默认 `http://127.0.0.1:3000`。修改后重启 Expo。

两个 `.env.example` 都不含密钥，真实 `.env` 已被 Git 忽略。`EXPO_PUBLIC_*` 会进入客户端，不得放秘密。当前绑定回环地址只供 PC Web 开发；手机访问、局域网开放、身份认证和生产部署不在本阶段范围内。CORS 不是身份认证，非浏览器请求也能访问本机接口。

## 接口

| 方法/路径 | 用途 |
| --- | --- |
| `GET /health` | 返回 `{ "ok": true, "service": "trailbook-api", "stage": "validation-only" }` |
| `POST /travel-requests/validate` | 接收 JSON 并独立校验，返回规范化的需求摘要 |

POST 示例请求：

```json
{
  "city": "重庆",
  "startDate": "2026-10-01",
  "endDate": "2026-10-03",
  "arrivalTime": "18:30",
  "departureTime": "14:00",
  "arrivalPlace": "重庆北站",
  "departurePlace": "江北机场",
  "hotel": "解放碑附近的住处",
  "guide": "",
  "interests": ["城市夜景"],
  "pace": "刚刚好",
  "transport": "步行＋地铁",
  "needs": ""
}
```

规则：仅支持重庆；日期为 2000–2100 年有效 `YYYY-MM-DD`，到离时间为 24 小时制 `HH:mm`，离开必须晚于到达，最多 7 个自然日（包含到达/离开日）；日期时间按 `Asia/Shanghai` 解释。地点/住宿为 1–120 字文字，不表示已定位。兴趣为前端选项中的 1–5 个不重复值；节奏、交通必须是已支持选项。攻略和特殊需求可省略，分别最多 2000/500 字。拒绝未知字段，文本首尾空白会移除；最大请求体 16 KiB。

成功返回 HTTP 200：

```text
{ ok: true, data: {
  status: "validated", request: <规范化输入>,
  timezone: "Asia/Shanghai", durationDays: 3,
  persisted: false, itineraryGenerated: false
} }
```

不会生成数据库 ID、调用规划器或返回假行程。原有独立固定样例仍由前端提供。

| HTTP | 错误代码 | 说明 |
| --- | --- | --- |
| 400 | `INVALID_JSON` | 无效 JSON |
| 403 | `ORIGIN_NOT_ALLOWED` | 不允许的网页来源 |
| 404 | `NOT_FOUND` | 接口不存在 |
| 413 | `PAYLOAD_TOO_LARGE` | 请求超过 16 KiB |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | 未使用 application/json |
| 422 | `VALIDATION_ERROR` | 字段或业务条件错误，附 `error.fields` / `error.formErrors` |
| 500 | `INTERNAL_ERROR` | 通用服务器错误，不向客户端暴露内部堆栈 |

失败统一为 `{ ok: false, error: { code, message, ... } }`，响应设置 `Cache-Control: no-store`。

## 文件与检查

- `src/server.ts`：监听端口与正常退出。
- `src/app.ts`：Hono 接口、CORS、请求体限制、JSON 错误响应。
- `src/schema.ts`：独立的 Zod 校验，不信任前端检查。
- `src/config.ts`：端口和 origin 配置检查。
- `tests/api.test.ts`：健康接口、输入边界、协议错误、CORS、与前端选项的一致性测试。生产后端不引用移动端代码。
- `package.json` / `package-lock.json`：后端自己的依赖、脚本和锁定版本。

```powershell
npm run typecheck
npm test
```

测试使用 Node 自带运行器，不需要另装框架。`node_modules` 不提交，锁文件应提交。前后端目前是两个独立 npm 项目，尚不需要引入共享 workspace 或任务编排工具。
