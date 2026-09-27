# Trailbook 最小开发环境

> 当前仓库只有文档、HTML 原型和目录占位。下面说明后续开发时需要的环境，不表示应用已经能安装或运行。此次整理没有安装任何软件或依赖。

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
| pnpm | 安装项目依赖、运行脚本 | 建立应用时 |
| Chrome 或 Edge | 调试管理后台 | 开发后台时 |
| MySQL 8.0+ | 保存地点和行程 | 开发数据层时 |
| Android 手机或模拟器 | 查看实际手机 App | 开发移动端时 |

Git 可以继续用于保存已有仓库的版本，不要求先设置分支流程、PR、提交钩子或 CI。编辑器插件和专用接口调试工具按需要使用。

## 3. Node.js 和 pnpm

从 [Node.js 官网](https://nodejs.org/)安装 Node.js 24 LTS。可用以下命令检查环境：

```powershell
node --version
npm --version
pnpm --version
```

如果 pnpm 尚未安装，再参照 [pnpm 安装文档](https://pnpm.io/installation)选择适合本机的方法。例如使用 npm 安装 pnpm：

```powershell
npm install -g pnpm
```

这只是手动安装说明，不要求现在执行。这里不依赖 Corepack；若使用 Corepack，需要先确认本机已经安装。

Node.js 是运行环境，pnpm 是安装依赖和执行命令的工具。未来的 `package.json` 记录依赖及命令，pnpm workspace 连接同仓库模块；正常生成的锁文件可以保留，不需要额外锁管理工具。

## 4. 数据层开发时准备 MySQL

可以直接安装 [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)，也可以连接已有开发数据库。使用开发专用数据库和账号，数据库名可设为 `trailbook`，字符集使用 `utf8mb4`。

Docker Compose 只是可选的本地运行方式，不是必须安装的工具。本仓库当前没有 `compose.yaml`。

Prisma 后续作为项目依赖安装，不需要单独全局安装。等模型和脚本建立后，再生成客户端、创建数据表并导入首批地点。数据库迁移用于保存表结构变化，应在数据层实现时正常保留。

## 5. 移动端开发时准备 Expo

React Native 和 Expo 后续安装在移动端项目中，使用项目自带的 Expo CLI。

- 开发基础界面时，可使用兼容当前 Expo 版本的 Expo Go 和 Android 真机。
- 使用模拟器或本地编译 Android 应用时，需要 [Android Studio](https://developer.android.com/studio)、Android SDK 和相应 JDK。
- 接入地图前，确认所选 SDK 的 React Native/Expo 支持情况。第三方原生模块不一定能在 Expo Go 中运行，可能需要 Development Build。
- 如果本地开发或编译 iOS，需要 macOS 和 Xcode；也可按 Expo 支持情况选择云构建，真机安装仍需对应签名条件。

Windows 可先完成 Android 开发。手机访问电脑上的本地 API 时，要使用电脑的局域网地址；手机中的 `localhost` 指向手机自身。

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

## 8. 应用建立之后再补充启动命令

当前没有 `package.json`、Prisma Schema、环境模板和启动脚本，因此暂不提供可直接执行的项目启动命令。

后续每完成一个模块，就补充对应的安装、启动和验证方法：先能打开最小页面并访问 API，再连上数据库，再接地图、天气和规划逻辑。确认这些功能能够工作即可，不要求先安装 ESLint、Prettier、测试框架或配置 GitHub Actions。

实现顺序见[最小实现方案](minimal-implementation-plan.md)，功能范围见[产品计划](../product/product-plan.md)。
