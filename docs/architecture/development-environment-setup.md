# Trailbook 最小开发环境

> 当前已建立 Expo/React Native 多页面前端演示，先在 PC 浏览器中预览；其他应用和公共模块仍为占位。实现沿用已安装依赖，没有新增 npm 依赖或安装全局工具。

## 1. 现在查看项目

使用编辑器阅读 Markdown，使用浏览器打开：

- [移动端原型](../prototypes/mobile-prototype.html)
- [管理后台原型](../prototypes/admin-prototype.html)
- [原型与首版范围](../prototypes/README.md)

查看这些文件不需要数据库、Node.js 或任何构建命令。

## 2. 开始写代码时准备

| 工具 | 用途 | 何时需要 |
| --- | --- | --- |
| 编辑器，例如 VS Code | 编辑 TypeScript、页面和配置 | 开始开发时 |
| Node.js 24 LTS | 运行后端和开发工具，自带 npm 包管理命令 | 开始开发时 |
| npm（随 Node.js 提供） | 安装项目依赖、运行脚本 | 当前移动端工程使用 |
| Chrome 或 Edge | 预览 Expo Web，之后调试管理后台 | 当前就需要 |
| MySQL 8.0+ | 保存地点和行程 | 开发数据层时 |
| Android 手机或模拟器 | 验证 Android 原生界面和设备能力 | 进入 Android 验证时，当前 Web 预览不需要 |

Git 可以继续用于保存已有仓库的版本，不要求先设置分支流程、PR、提交钩子或 CI。编辑器插件和专用接口调试工具按需要使用。

## 3. Node.js 和 npm

从 [Node.js 官网](https://nodejs.org/)安装 Node.js 24 LTS。可用以下命令检查环境：

```powershell
node --version
npm --version
```

当前使用 Node.js 自带的 npm，不需要另装 pnpm，也不需要全局安装 Expo 或 TypeScript。在项目根目录打开终端：

```powershell
cd apps/mobile
npm run web
```

如果是新检出的项目，还没有 `node_modules`，先在 `apps/mobile` 执行 `npm ci`；已经安装就跳过。访问启动日志显示的地址，通常为 `http://localhost:8081`。端口被占用时按终端提示选择其他端口，或运行 `npm run web -- --port 8082`。

`package.json` 记录依赖和脚本，`package-lock.json` 固定安装结果，依赖放在该项目的 `node_modules` 中。npm 还会使用用户级缓存，但这不等于全局安装项目依赖。当前没有根目录 workspace。依赖目录、Expo 缓存和构建产物已由根目录 `.gitignore` 忽略，清单和锁文件应保留。

## 4. 数据层开发时准备 MySQL

可以直接安装 [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)，也可以连接已有开发数据库。使用开发专用数据库和账号，数据库名可设为 `trailbook`，字符集使用 `utf8mb4`。

Docker Compose 只是可选的本地运行方式，不是必须安装的工具。本仓库当前没有 `compose.yaml`。

Prisma 后续作为项目依赖安装，不需要单独全局安装。等模型和脚本建立后，再生成客户端、创建数据表并导入首批地点。数据库迁移用于保存表结构变化，应在数据层实现时正常保留。

## 5. 移动端开发时准备 Expo

React Native 和 Expo 已作为移动端项目依赖安装，`npm run web` 使用项目内的 Expo CLI 启动 Metro 开发服务。页面通过 React Native Web 在浏览器显示，不是 Android 模拟器。

当前先完成基础界面和交互，之后再验证原生端：

- 开发基础界面时，可使用兼容当前 Expo 版本的 Expo Go 和 Android 真机。
- 使用模拟器或本地编译 Android 应用时，需要 [Android Studio](https://developer.android.com/studio)、Android SDK 和相应 JDK。
- 接入地图前，确认所选 SDK 的 React Native/Expo 支持情况。第三方原生模块不一定能在 Expo Go 中运行，可能需要 Development Build。
- 如果本地开发或编译 iOS，需要 macOS 和 Xcode；也可按 Expo 支持情况选择云构建，真机安装仍需对应签名条件。

没有 Android 真机时，到 Android 验证阶段再准备模拟器即可。Web 预览通过不代表原生地图、权限、键盘和安全区域都已验证。手机访问电脑上的本地 API 时，要使用电脑的局域网地址；手机中的 `localhost` 指向手机自身。

## 6. 接外部服务时准备账号

依次选择并开通：

1. 地图：手机地图 SDK，以及后端地址搜索、地理编码和路线接口。
2. 天气：能覆盖试点城市及所需日期的天气接口。
3. 大模型：支持结构化输出的 API，主流程跑通后接入。

确认地图坐标系、交通方式覆盖、天气预报范围、调用配额和费用。地图标记显示成功不代表路线计算接口也已开通。

## 7. 后续环境变量

实现 API 时再建立环境模板，示意如下：

```env
API_PORT=3000
DATABASE_URL=mysql://trailbook_dev:replace_me@localhost:3306/trailbook
MAP_API_KEY=replace_me
WEATHER_API_KEY=replace_me
LLM_API_KEY=replace_me
```

API 负责加载实际环境变量。移动端和后台只配置 API 地址，以及地图 SDK 必须使用的受限客户端 Key。模型、天气和服务端地图密钥不写入客户端；客户端公开变量可被使用者读取。

未来本地 `.env` 不提交，`.env.example` 只放示例。实际变量名按选定供应商确定。

## 8. 当前检查与后续范围

在 `apps/mobile` 中运行 `npm run typecheck` 检查 TypeScript，`npm test` 使用 Node 24 自带测试运行器检查表单校验、锁定保护和演示存储结构。无需安装第三方测试框架。当前页面只有本地交互和固定演示内容，无需 `.env`、Prisma Schema、数据库或后端进程。

浏览器保存使用 `localStorage`，只保存用户主动保存的演示副本及收藏。需求表单不持久化、不上传。读写失败会显示提示，损坏数据不会自动覆盖；可通过“我的”里的确认操作清除本应用的演示存储。原生端暂时仅有内存存储，不应宣传为原生持久化完成。

Expo 启动时可能尝试准备原生 React Native DevTools。如果出现该工具准备失败的警告，但 Web 服务和页面仍正常，可先使用浏览器开发者工具；不要为了当前 Web 预览额外安装 Android 工具。

后续每完成一个模块，就补充对应的安装、启动和验证方法：先能打开最小页面并访问 API，再连上数据库，再接地图、天气和规划逻辑。确认这些功能能够工作即可，不要求先安装 ESLint、Prettier、测试框架或配置 GitHub Actions。

实现顺序见[最小实现方案](minimal-implementation-plan.md)，功能范围见[产品计划](../product/product-plan.md)。
