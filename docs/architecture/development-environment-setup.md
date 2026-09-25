# Trailbook 开发环境安装步骤

## 1. 安装 Git

Windows：安装 [Git for Windows](https://git-scm.com/download/win)。

安装后打开 PowerShell，验证：

```powershell
git --version
```

首次使用时配置提交信息：

```powershell
git config --global user.name "你的姓名"
git config --global user.email "你的邮箱"
```

## 2. 安装 Node.js 24 LTS

从 [Node.js 官网](https://nodejs.org/) 安装 Node.js 24 LTS。

验证：

```powershell
node --version
npm --version
```

Node.js 版本应为 `24.x`。

## 3. 启用 Corepack 并准备 pnpm

```powershell
corepack enable
corepack prepare pnpm@latest --activate
pnpm --version
```

项目初始化后，以仓库 `package.json` 中固定的 pnpm 版本为准。

## 4. 安装 Docker Desktop

从 [Docker Desktop 官网](https://www.docker.com/products/docker-desktop/) 安装 Docker Desktop。

Windows 安装时启用 WSL 2 后端。启动 Docker Desktop，验证：

```powershell
docker --version
docker compose version
```

项目使用 Docker 运行 MySQL，不需要在本机单独安装 MySQL Server。

## 5. 安装开发编辑器

安装 VS Code 或团队统一的 IDE，并建议安装以下扩展：

- ESLint
- Prettier
- TypeScript
- Prisma
- EditorConfig

## 6. 安装 Android 开发环境

安装 [Android Studio](https://developer.android.com/studio)。在安装向导中启用：

- Android SDK
- Android SDK Platform-Tools
- Android SDK Build-Tools
- Android Emulator
- Android Virtual Device

打开 Android Studio 的 SDK Manager，安装与项目配置匹配的 Android SDK Platform 和 SDK Tools。

创建一个 Android Virtual Device，或准备一台开启 USB 调试的 Android 真机。

验证设备连接：

```powershell
adb devices
```

如果使用 Android 真机，开启手机的开发者选项和 USB 调试，并接受电脑授权提示。

## 7. 安装 Expo 开发工具

项目初始化后进入移动端目录，安装依赖：

```powershell
pnpm install
```

使用项目依赖运行 Expo，不建议全局安装旧版 Expo CLI：

```powershell
pnpm exec expo --version
```

如果项目使用 Expo Development Build，按项目配置安装对应的 Android 原生依赖并重新构建开发客户端。

## 8. 安装浏览器和接口调试工具

安装最新版 Chrome 或 Edge，用于 Web 管理后台调试。

安装 [Apifox](https://apifox.com/) 或 [Postman](https://www.postman.com/)，用于验证 API、请求参数、错误码和认证流程。团队统一选择其中一个工具。

## 9. 获取项目代码

```powershell
git clone https://github.com/luoyjlyj/Trailbook.git
cd Trailbook
git switch main
```

如果团队指定使用 `develop`：

```powershell
git switch develop
```

## 10. 安装项目依赖

在仓库根目录执行：

```powershell
pnpm install
```

确认根目录使用单一的 `pnpm-lock.yaml`，不要混用 npm 或 yarn 锁文件。

## 11. 配置环境变量

项目初始化后，复制环境变量模板：

```powershell
Copy-Item .env.example .env
```

至少配置：

```env
DATABASE_URL=mysql://user:password@localhost:3306/travel_app
MAP_API_KEY=你的地图服务开发密钥
WEATHER_API_KEY=你的天气服务开发密钥
LLM_API_KEY=你的模型服务开发密钥
```

真实密钥只能保存在本地或受控部署环境，不得提交到 Git。

## 12. 启动 MySQL

确认仓库根目录已有 `compose.yaml`，并且数据库服务名为 `db` 后执行：

```powershell
docker compose up -d db
docker compose ps
```

确认 MySQL 使用 `utf8mb4` 字符集。数据库连接端口默认为 `3306`。

## 13. 执行 Prisma 数据库初始化

项目初始化后，在仓库根目录执行：

```powershell
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed
```

验证数据库读写和 Prisma Studio：

```powershell
pnpm prisma studio
```

## 14. 启动项目

```powershell
pnpm dev
```

如果项目未提供统一启动脚本，分别启动 API、Web 管理端和移动端：

```powershell
pnpm --filter api dev
pnpm --filter admin dev
pnpm --filter mobile start
```

实际脚本名称以根目录和各 workspace 的 `package.json` 为准。

## 15. 安装完成检查

依次执行：

```powershell
node --version
pnpm --version
git --version
docker --version
docker compose version
adb devices
pnpm typecheck
pnpm lint
pnpm test
```

最后使用 Apifox/Postman 验证地点查询和行程生成接口，再在 Android 模拟器或真机完成以下流程：

```text
填写出行信息 → 生成行程 → 查看时间线 → 切换地图 → 替换雨天活动 → 保存行程
```

## 16. 可选环境

- iOS 开发：需要 macOS、Xcode 和 iOS Simulator。
- 真机地图测试：需要地图服务开发密钥、定位权限和可用网络。
- 生产部署：另行准备 MySQL、API、Web、对象存储、域名和密钥管理环境。

