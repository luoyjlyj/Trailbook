# CI 基线

阶段 0 的 CI 工作流位于 `.github/workflows/ci.yml`，使用 Node.js 版本文件和固定的 pnpm 版本，不依赖个人路径或真实密钥。

每次 push 到 `main`/功能分支或创建 Pull Request 时，CI 按以下顺序执行：

1. `pnpm install --frozen-lockfile`
2. `pnpm format:check`
3. `pnpm lint`
4. `pnpm typecheck`
5. `pnpm test`
6. `pnpm build`

任一步骤失败都会使 job 失败。阶段 0 不启动数据库，也不要求真实 API Key；数据库集成测试和测试容器在后续阶段按需要加入。
