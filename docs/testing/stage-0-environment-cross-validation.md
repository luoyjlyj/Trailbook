# Trailbook 阶段 0 环境互验报告

> 版本：0.2｜记录日期：2026-09-26｜负责人：成员 A
>
> 对应任务：TB-0004｜状态：已补 D 的统一工程与 CI 成员报告、A 在统一提交上的独立互验；全员互验尚未完成

## 1. 报告目的与依据

依据[阶段 0 任务书第 9、11 节](../architecture/stage-0-parallel-development-task-book.md)，确认团队能在统一工程提交上从零安装并运行基础检查。

最低覆盖要求：

- 至少两台不同设备完成从零安装；同时按任务书第 9.2 节覆盖两类操作系统。
- 五名成员提交基础检查记录，未完成项目写明原因、负责人和处理期限。
- workspace 可识别，格式、Lint、类型检查、测试和构建入口可执行。
- 阶段 0 检查不依赖真实服务密钥、本地业务数据库或个人绝对路径。
- CI 结果能对应到验收的提交编号。

版本基线引用[开发环境说明](../architecture/development-environment-setup.md)。本报告不重新选择工具版本，也不把团队已完成的版本更新重新列为未完成；需补的是 A 的实际环境及最新统一提交的验证证据。

## 2. 状态和证据口径

| 状态 | 含义 |
| --- | --- |
| 已观察 | 本次命令输出或本机元数据可直接证明的事实 |
| 成员报告 | 成员描述已完成，尚未在统一提交上汇总复核 |
| 通过 | 已执行规定步骤，有版本/提交/日志支持且结果符合标准 |
| 失败 | 已执行规定步骤，结果不符合标准 |
| 未执行 | 尚未运行；不能推断为通过或失败 |
| 待确认 | 安装位置、实际版本、执行条件或责任安排尚缺证据 |
| 不适用 | 当前角色/阶段不要求，附理由；不代替其他成员必测项 |

初次环境观察详见第 4.1～4.4 节。本版新增 A 在 D 提供的完整工程提交上进行的独立互验；未启动数据库、未验证 Android 设备，也未将 D 的设备/Docker 缺项推定为通过。

## 3. 统一验收基线

| 项目 | 当前记录 |
| --- | --- |
| 仓库 | `luoyjlyj/Trailbook` |
| 统一验收分支与完整提交 SHA | `lyj/p0-20260925`；`02c6ba05992385f1bf001796bde0ebadafead4c2`（D 提供，包含 A 先前的阶段 0 文档提交） |
| 统一提交 CI | D 报告 [GitHub Actions run 36225367488](https://github.com/luoyjlyj/Trailbook/actions/runs/36225367488) 通过；本记录尚未独立复核该 run 页面 |
| A 文档分支与最新提交 | `mxy/p0-20260926`；`1f1dd6d2e2d4a0af7e00b4e990d1e6d2df3f19f8`；PR [#3](https://github.com/luoyjlyj/Trailbook/pull/3) 仍开放，目标为 `main` |
| 分支包含关系 | D 的 `02c6ba0` 包含 A 先前提交 `b59927e`，不包含 A 后续验收门槛更新 `1f1dd6d`；D 分支尚未合并到 `main` |
| A 独立互验检出 | 新建完整 detached worktree，检出 `02c6ba05992385f1bf001796bde0ebadafead4c2`；原 `mxy/p0-20260926` 文档检出保持不变 |
| A 原工作树 | `mxy/p0-20260926`，稀疏检出规则为 `docs`；不用于本次工程命令验证 |
| Node.js 目标 | 24.21.0 LTS，引用现有项目文档 |
| pnpm 目标 | 11.28.0，引用现有项目文档；用户已确认团队完成版本更新 |
| Docker Compose 目标 | 5.5.1，引用现有项目文档 |
| 浏览器目标 | Chrome 154 Stable，可自动更新并记录完整版本 |
| 接口工具目标 | Apifox 2.8.48；如正式选择 Postman，另记录团队决议 |

原 A 文档工作树仍是 `docs` 稀疏检出；本版通过独立完整 worktree 在 D 指定提交上验证，因此没有改动或清除原分支的稀疏规则。D 提供的 `02c6ba0` 尚未合并到 `main`，本报告把它作为本轮临时统一互验基线，不将其描述为已合并工程。

## 4. A 的本机记录

### 4.1 观察范围

- 设备代号：`A-WIN-01`；不记录个人用户名、主机名或设备序列号。
- 观察日期：2026-09-26；版本/仓库读取约在北京时间 13:48–13:51 完成。
- 操作系统：Windows x64；注册表版本标识 25H2，Build 26200.9457。系统商品名称由 A 在系统设置复核，本次不根据旧注册表名称推断。
- 执行上下文：Codex 当前 PowerShell 工具进程。其 PATH 可能与 A 正常打开的 Git Bash/PowerShell 不同，正式互验还需在全新普通终端确认。
- 实际项目已迁移到 F 盘。本报告中的公共操作均以“仓库根目录”表示，不要求其他成员使用 A 的路径。

### 4.2 初次工具观察与差异（历史记录）

| 项目 | 本次观察证据 | 判定与下一步 |
| --- | --- | --- |
| Git | `git --version` → `2.41.0.windows.1` | 命令可调用；新克隆/远程访问不在本次验证范围 |
| Node.js | `node --version` → `v22.23.2` | 当前工具进程与目标 24.21.0 不一致；A 在普通终端核对并选择项目规定运行时 |
| pnpm | `pnpm --version` → `11.19.0`；命中 Codex 自带备用入口，包元数据同版本 | 只证明当前工具进程使用的版本；A 普通终端及团队统一提交的版本仍需单独记录，不推翻团队已升级的报告 |
| Docker CLI | 当前 PATH 未找到；常用安装位置与所查询卸载注册表未发现对应记录 | 待确认是否安装在其他位置；不能据此断言全机未安装 |
| Docker Compose | 因当前未定位 Docker CLI，未取得版本 | 未执行；找到 CLI 后记录 Compose 与引擎状态 |
| Chrome | 可执行文件与安装元数据均为 `153.0.8010.53` | 与项目文档 Chrome 154 基线不同；A 记录更新后的实际稳定版再互验 |
| Edge | 安装元数据 `153.0.4234.48` | 仅附加环境信息；是否用于补充兼容检查由团队记录 |
| Apifox | 安装注册表显示 `2.4.5`；未取得有效可执行文件版本 | 元数据可能滞后；A 从应用“关于”确认，当前不能判为符合 2.8.48 |
| Postman | 安装元数据 `10.23.5` | 仅说明发现该安装记录；未作为团队选定接口工具通过验收 |
| Android SDK / ADB | 当前 PATH 未找到 ADB；常用用户 SDK 位置未发现 ADB；相关环境变量未设置 | A 当前统筹角色不要求配置 Android；B 的移动端设备验证仍需独立完成 |
| Android Studio | 所查询安装记录未发现 | 对 A 本次环境记录不作阶段 0 阻断；不代表 B 的安装情况 |

没有在本次记录中自动升级、卸载或修改任何工具版本。

### 4.3 A 初次工程检查结果（已由 4.5 补充）

| 检查项 | 结果 | 原因 / 下一步证据 |
| --- | --- | --- |
| 读取 Git 分支、HEAD、远程 | 已观察 | 分支与 HEAD 见第 3 节，远程为项目 GitHub 仓库 |
| 独立完整检出 | 已通过 | 在独立 worktree 检出 `02c6ba0`；原文档稀疏工作树未更改 |
| 固定工具版本文件一致 | 通过 | `.nvmrc` 与 `package.json` 要求 Node `24.21.0`、pnpm `11.28.0` |
| 识别全部 workspace | 通过 | 根项目加 9 个 workspace，共 10 个 |
| 从零安装依赖 | 通过 | `pnpm install --frozen-lockfile`；锁文件未变更 |
| 格式检查 | 通过 | `pnpm format:check` |
| Lint | 通过 | `pnpm lint` |
| 类型检查 | 通过 | `pnpm typecheck` |
| 测试 | 通过（重试） | 首次受限进程报 `spawn EPERM`；提权重试后 1 个测试通过 |
| workspace 构建 | 通过 | `pnpm build`；阶段 0 workspace 使用 no-op 占位构建脚本 |
| `.env.example` 与免真实密钥运行 | 模板已观察 | 示例值为占位文本；仅检查模板，不是仓库全量密钥扫描 |
| Docker/端口验证 | 未执行 | 未定位 CLI；具体需运行的阶段 0 服务由 D 确认，不提前启动业务数据库 |
| Android 模拟器/真机 | 不适用（A 本次角色） | 由 B 提供 `device` 状态和后续真实 SDK 证据 |
| 对应统一 SHA 的 CI | 成员报告 | D 提供 `02c6ba0` 对应 CI 链接并报告通过；A 未独立复核 run 页面 |

### 4.4 可复核的初次读取摘要（历史观察）

```text
观察日期：2026-09-26，Asia/Shanghai
Git: 2.41.0.windows.1
Node in current tool process: v22.23.2
pnpm in current tool process: 11.19.0 (bundled fallback)
Chrome executable: 153.0.8010.53
Apifox uninstall metadata: 2.4.5 (application version not verified)
Branch: mxy/p0-20260926
HEAD: 5c7ae1c2044a777452c9dcb80c4fd036e1f2f895
Sparse checkout: docs
Root package/workspace/lockfile/version/environment files: absent in this HEAD
Install / format / lint / typecheck / test / build: not run
```

### 4.5 A 在统一提交上的补充互验

本节是 2026-09-26 对 D 指定统一提交的补充记录，和 4.4 节的初次观察分开保留。

| 项目 | 结果 |
| --- | --- |
| 提交 / 检出 | `02c6ba05992385f1bf001796bde0ebadafead4c2`；独立完整 worktree，detached HEAD |
| 操作系统 | Windows x64；Codex PowerShell 执行环境 |
| Node.js | `v24.21.0`；使用 [Node.js 官方 Windows x64 ZIP](https://nodejs.org/en/download/archive/v24.21.0)，SHA-256 `158f7685b44de51f6c0df1d153526cbcd3e1bc739a8dfc607721cef75de9e541`，在隔离验证目录调用，不覆盖系统 Node |
| pnpm | `11.28.0`；通过隔离 Node 附带的 Corepack 调用，验证期间只在该进程覆盖 PATH |
| workspace | `pnpm -r list --depth -1` 识别根项目和 9 个 workspace，共 10 个 |
| 安装 | `pnpm install --frozen-lockfile`：通过；锁文件无需更新；185 个包安装完成 |
| 格式 / Lint / 类型检查 | `pnpm format:check`、`pnpm lint`、`pnpm typecheck`：通过 |
| 测试 | `pnpm test`：首次在受限执行环境报 `spawn EPERM`；在同一提交重试后 1 个测试文件、1 个测试通过 |
| 构建 | `pnpm build`：通过；9 个 workspace 的构建脚本为阶段 0 no-op 占位脚本 |
| 开发入口 | `pnpm dev`：退出码 0；阶段 0 未提供实际服务进程，不代表业务服务已启动 |
| 环境模板 / 密钥 | `.env.example` 使用本地占位值；本次仅检查该模板，不做仓库全量密钥扫描 |
| Docker / Compose | A 当前工具进程未找到 Docker CLI，版本未验证；不启动 MySQL。D 也承诺在 TB-0004 会签前补充本机 Docker/Compose 记录 |
| 工具安装范围 | Node ZIP、Corepack 缓存和验证依赖位于独立 worktree 的未跟踪 `.toolcache` 与 `node_modules`；未覆盖系统 Node/pnpm，也未改动工程源文件 |

本次互验通过的是上述提交的 Windows 基础工程命令。D 提供的 Linux CI 属于另一环境证据；其设备、Docker/Compose 版本仍需成员记录。Chrome/Apifox 的实际版本和普通终端 PATH 也尚未复核。

## 5. 全体成员汇总框架

以下按用户最新说明记录：B、C、E 的阶段 0 交付尚未全部完成。早期报告可作线索，不能替代本轮统一提交的验收证据。

| 成员 | 设备 / OS | 分支 / 统一 SHA | 工具版本 | 安装与基础检查 | 专项记录 | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- |
| A | A-WIN-01；Windows x64 | 文档分支 `mxy/p0-20260926`；在 `02c6ba0` 独立验证 | 隔离验证 Node 24.21.0 / pnpm 11.28.0；普通工具 PATH 仍需另行确认 | 安装、格式、Lint、类型、测试、构建通过 | 需求与验收文档已提交 PR #3；Android 不适用；Docker 待补 | A 的基础工程互验通过；团队互验待完成 |
| B | 待提交本轮完整记录 | 待填写 | 用户报告团队已更新；需本机输出 | 早期报告曾通过，统一 SHA 记录待补 | 模拟器或真机 `device` 证据待补；页面交付待完成 | 待完成/会签 |
| C | 待填写 | 待填写 | 待填写 | 待填写 | 后台入口、模块和页面状态记录 | 待完成/会签 |
| D | 待补 | `lyj/p0-20260925` / `02c6ba0` | 成员报告 Node 24.21.0、pnpm 11.28.0 | D 报告安装、dev、格式、Lint、类型、测试、构建通过；10 workspace；CI run 36225367488 通过 | Docker/Compose 与设备/系统命令记录待补；阶段 1 POC/数据字典待交付 | 工程与 CI 成员报告已收；TB-0004 补证待完成 |
| E | 待填写 | 待填写 | 待填写 | 待填写 | 规划包入口、场景与约束输入 | 待完成/会签 |

此前 D 的 [CI 成功记录](https://github.com/luoyjlyj/Trailbook/actions/runs/36101940075) 对应 `2f76c625b47a8a624ce01c6f85e6160554504899`，仅作为历史基线证据。D 最新报告另提供 `02c6ba0` 对应的 [CI run 36225367488](https://github.com/luoyjlyj/Trailbook/actions/runs/36225367488)，该链接尚未由 A 独立打开复核。

## 6. 下一轮互验执行安排

1. 统一工程基线已由 D 提供为 `lyj/p0-20260925` / `02c6ba0`，A 已在独立验证目录完成 Windows 基础检查；其他成员仍需对同一 SHA 提交记录。
2. 每人使用新终端和独立验证目录检出同一 SHA；使用完整工程内容，保留原工作目录和未提交修改。
3. 记录系统、工具版本、依赖锁文件与 workspace；先排除 PATH 误命中，再安装依赖。
4. 按该提交实际根脚本执行安装、格式、Lint、类型检查、测试和构建。与 CI 一致使用冻结锁文件的安装方式，若脚本不同以 D 提供的基线说明为准。
5. 分别保存命令、完整输出、退出码、执行时间和提交 SHA。涉及日志先脱敏，不把密钥或个人路径复制为公共配置。
6. B 额外提交 Android 设备记录；A 汇总第二台设备和第二类 OS 覆盖情况。CI 的 Linux 运行不能自动替代成员在第二类开发系统上的互验记录。
7. 问题修复后，受影响检查在约定提交上复验；若修改了基线，应记录新旧 SHA，不能将不同提交的零散通过结果拼成一次通过。

建议的根检查入口如下，仅供下一轮执行；本次未运行。实际脚本名称和 workspace 列表应先由 D 确认：

```text
pnpm install --frozen-lockfile
pnpm -r list --depth -1
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

不要把开发环境文档中后续阶段的真实 API Key、MySQL、Prisma 或 Expo 业务启动步骤误作阶段 0 必须条件。阶段 0 工程检查应遵循阶段 0 任务书和实际 CI 基线。

## 7. 问题清单与责任

下表采用里程碑截止节点，具体日历日期由 A 在启动日确定后填写；当前不声称成员已经承诺某个日期。

| 编号 | 问题 / 缺口 | 影响 | 负责人 / 协作 | 处理动作 | 最晚节点 |
| --- | --- | --- | --- | --- | --- |
| ENV-01 | A 普通工具 PATH 仍命中 Node 22.23.2；隔离验证环境已用 Node 24.21.0 通过检查 | 普通终端直接操作可能仍调用旧版本 | A / D | A 在普通终端核对版本管理/ PATH；本次隔离互验记录见 4.5 | TB-0004 会签前 |
| ENV-02 | A 普通工具 PATH 仍命中 pnpm 11.19.0；隔离验证环境使用 11.28.0 通过检查 | 直接运行命令可能仍调用旧备用入口 | A / D | A 在普通终端核对 `pnpm --version`；不要求团队重复升级 | TB-0004 会签前 |
| ENV-03 | A 原工作树仍是 docs 稀疏检出 | 原工作树不适用于工程验证 | A 已在独立完整 worktree 解决；不改原工作树 | 后续检查继续使用完整提交的独立验证目录 | 已完成 |
| ENV-04 | A 未定位 Docker，Compose 未验证 | 环境清单缺证据 | A / D | 确认安装/位置/版本；是否为当前检查阻断由 D 依据阶段 0 依赖说明 | TB-0004 会签前 |
| ENV-05 | Chrome 153；Apifox 仅旧安装元数据 | 浏览器/接口工具未证明符合基线 | A | 正常应用界面确认实际版本，按统一版本准备后记录 | TB-0004 会签前 |
| ENV-06 | 尚无完整第二设备、第二类 OS 记录 | 不满足任务书覆盖要求 | A / 全体 | 确定承担第二类系统的成员，收集同一 SHA 的从零记录 | 阶段 0 关闭前 |
| ENV-07 | B 尚缺本轮设备可用证据 | Android 验证条件不完整 | B / D，A 跟踪 | 提交模拟器或真机 `device` 状态；真实地图 POC 在阶段 1 继续 | 设备项阶段 0 会签前；地图 TB-0102 |
| ENV-08 | D 已提供工程 SHA 和 CI 成功链接；A 尚未独立复核 CI 页面 | CI 证据来自成员报告 | D / A | 归档 run 链接和版本文件；A 可访问时复核提交 SHA/结果 | TB-0004 会签前 |
| ENV-09 | push CI 当前只覆盖 `main`、`lyj/**`；PR CI 覆盖所有 PR | 其他分支直接 push 不会触发独立分支 CI | A / D | A 建议暂不扩展 push 触发；把 PR 检查作为合并门槛，并确认 `main` 保护规则要求 CI 通过。仓库保护设置尚未核验 | TB-0004 会签前 |

## 8. 阶段 0 环境验收结论

当前结论：**未完成，不具备全员互验通过的证据。** 已完成的是报告框架、A 的只读环境观察、差异与责任登记。

| 关闭检查 | 当前结果 |
| --- | --- |
| 统一完整工程 SHA 与工具版本已记录 | D 已提供；A 在该 SHA 完成隔离互验，成员记录仍待汇总 |
| 至少两台设备从零安装并完成基础检查 | A 的 Windows 验证完成；第二台设备记录待补 |
| 两类操作系统覆盖 | 待完成 |
| 五名成员检查结果或明确未完成原因 | A 已记录；其他成员待补 |
| 对应提交 CI 成功证据 | D 报告 run 36225367488 通过；待 A 可访问时独立复核并归档 |
| B Android 设备条件 | 待补 |
| 所有问题有负责人及期限 | 已列负责人/相对节点；具体日期待 A 约定 |

阶段 0 整体关闭还需[需求与验收矩阵](../product/mvp-user-stories-and-acceptance-matrix.md)会签及其他任务交付。后续决策见[阶段 1 待确认事项与责任清单](../product/stage-1-decisions-and-responsibilities.md)。
