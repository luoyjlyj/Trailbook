# Mobile app

## 阶段 0 状态

当前目录是移动端 workspace 占位入口，包名为 `@trailbook/mobile`。阶段 0 只验证目录、workspace、统一脚本和移动端开发环境，不实现 Expo 页面或业务功能。

根目录命令会识别该 workspace：

```text
pnpm --filter @trailbook/mobile build
```

当前移动端只提供占位构建脚本；`pnpm --filter @trailbook/mobile start` 和 Expo 启动命令要等客户端初始化任务完成后再加入，不能将当前原型 HTML 当作移动端运行入口。

## 后续 Expo 初始化要求

- 使用项目锁定的 Node.js 24.21.0 和 pnpm 11.28.0。
- 由客户端初始化任务确定 Expo SDK、React Native、TypeScript 和导航依赖的兼容版本，并提交到 workspace 的 `package.json` 和锁文件。
- 优先使用项目本地 Expo CLI，通过 `pnpm exec expo` 执行，不安装全局旧版 CLI。
- 初始化后至少提供 `dev`/`start`、`android` 和 `build` 的明确脚本，并在根目录命令中保持可发现。
- Android 验证需要 Android SDK、Platform-Tools、Build-Tools、模拟器或开启 USB 调试的真机。
- 地图、天气和模型服务在阶段 0 使用 mock 或占位输入，不要求真实密钥。

页面映射、状态边界和设备验证记录见：

- `docs/architecture/mobile-stage-0-baseline.md`
- `docs/testing/mobile-device-validation.md`
