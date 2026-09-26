# 移动端设备验证记录

最近复核：2026-09-26

## 1. 验证目的

确认成员 B 可以从全新终端完成阶段 0 的安装、静态检查和移动端环境检查，为 TB-0004 提供证据。

阶段 0 不要求启动真实地图、天气、模型或数据库服务，也不要求真实 API Key。

## 2. 验证命令

在仓库根目录执行：

```text
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm --filter @trailbook/mobile build
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Android 环境执行：

```text
adb devices
```

## 3. 记录表

| 项目 | 结果 | 备注 |
|---|---|---|
| 操作系统 | 通过 | Windows，系统构建号 26200 |
| 设备/模拟器 | 待配置或连接 | 当前未配置 AVD，也没有连接 Android 真机 |
| Node.js | 通过 | 本地终端执行 `node --version` 为 `v24.21.0`，与项目固定版本一致；Codex 自带运行时版本不作为本机验收结果 |
| pnpm | 通过 | `11.28.0`，与项目固定版本一致 |
| Git | 通过 | `2.44.0.windows.1`，能正常读取仓库 |
| `pnpm install --frozen-lockfile` | 通过 | 使用本地 Node.js 24.21.0 执行；全部 10 个 workspace 已是最新状态，未产生第二份锁文件 |
| 移动端 workspace build | 通过 | `@trailbook/mobile` 阶段 0 占位构建成功 |
| `pnpm lint` | 通过 | 无 ESLint 错误 |
| `pnpm typecheck` | 通过 | 无 TypeScript 错误 |
| `pnpm test` | 通过 | Vitest：1 个测试文件、1 个测试通过 |
| `pnpm build` | 通过 | 9 个可构建 workspace 的阶段 0 构建入口执行成功 |
| Android SDK | 通过 | SDK 位于 `%LOCALAPPDATA%\Android\Sdk`；Platform `android-37.0`，Build-Tools `36.0.0` |
| `adb devices` | 部分通过 | ADB `1.0.41`（Platform-Tools `37.0.1`）可启动，但设备列表为空 |
| Android Studio | 已安装 | `AI-261.26222.65.2614.16379836`；当前 SDK 未安装 system image，AVD 列表为空；验证流程不依赖个人安装路径 |
| 网络/权限问题 | 无工程阻塞 | `platform-tools` 尚未加入 PATH；可使用 SDK 下的 `adb.exe`，或配置环境变量后重开终端 |

## 4. 当前待完成项

1. 通过 Android Studio 的 SDK Manager 安装一个与项目验证范围匹配的 Android system image，并在 Device Manager 创建、启动 AVD；或者连接已开启 USB 调试并完成电脑授权的 Android 真机。
2. 再次执行：

```text
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices -l
```

设备状态为 `device` 后，移动端阶段 0 的本机设备环境验证即可关闭。

| 未完成项 | 负责人 | 预计补齐时间 | 关闭证据 |
|---|---|---|---|
| 安装 Android system image，创建并启动 AVD；或连接已授权真机 | B | 2026-09-26，最迟在 A 组织统一环境互验前 | `adb devices -l` 显示至少一个状态为 `device` 的设备 |

## 5. 后续客户端最小验证流程

Expo 初始化完成后，再增加以下验证：

```text
启动移动端 → 创建计划 → 生成状态 → 查看行程时间线
→ 切换地图视图 → 打开地点详情 → 调整一站 → 返回行程
```

该流程中的地点、天气、路线和推荐内容在真实服务未验证前必须标注为 mock 或演示数据。
