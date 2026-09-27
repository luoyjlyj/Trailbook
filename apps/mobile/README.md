# Trailbook 移动端

当前是基于原型编写的 React Native 首页，使用 Expo 在 PC 浏览器中预览。不是把 HTML 放进 App，也还不是完整旅行应用。

## 启动和检查

在本目录执行（从仓库根目录进入：`cd apps/mobile`）：

```powershell
npm run web
```

访问终端显示的地址，通常是 `http://localhost:8081`。指定端口可用 `npm run web -- --port 8081`。修改页面后，开发服务会更新页面；Ctrl+C 停止服务。

已有依赖不必重装。新检出项目可先执行 `npm ci`，按锁文件安装。无需全局安装 Expo、TypeScript 或 pnpm。

```powershell
npm run typecheck
```

该命令只做类型检查，不启动页面。`npm start` 则启动 Expo 开发服务，让你自行选择目标平台；当前只验证 Web。

## 文件用途

| 文件 | 用途 |
| --- | --- |
| `package.json` | 依赖清单、Expo Router 入口和启动/检查命令 |
| `package-lock.json` | 固定 npm 安装结果，保留并提交，不手工修改 |
| `app.json` | 应用名称、Expo Router 插件和 Web 构建配置 |
| `tsconfig.json` | 继承 Expo 的 TypeScript 配置，开启严格类型检查 |
| `app/_layout.tsx` | 页面公共入口，提供安全区域和状态栏配置 |
| `app/index.tsx` | 首页路由，显示 HomeScreen |
| `src/screens/HomeScreen.tsx` | 首页布局、样式、演示卡片和提示弹窗 |
| `src/assets/prototype-photos.ts` | 从原 HTML 原型复用的四张内嵌演示图片，预览不依赖外链 |

`node_modules` 是本项目依赖，`.expo` 是开发缓存，均由仓库根目录 `.gitignore` 忽略，不应提交。当前不需要 `.env`。

## 已实现与未实现

已实现：首页排版、示例行程和图片展示、底部入口、说明弹窗。未实现的按钮会明确提示，不会假装保存成功或生成真实行程。

尚未实现：创建计划表单、真实页面跳转、API、数据库、地图、天气、模型和行程生成/保存。图片与重庆行程来自原型演示，不代表核验过的地点信息。

当前不需要 Android Studio 或 JDK。后续验证 Android 原生运行时，再准备真机或模拟器；Web 预览不能替代原生端验证。
