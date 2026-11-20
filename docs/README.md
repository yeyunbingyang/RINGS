# RINGS（年轮）项目文档体系

> 文档体系版本：v1.0.2  
> 建立日期：2026-11-17  
> 产品需求基线：RINGS PRD v2.2.2  
> 原型参考基线：用户确认的 `prototype.zip`（内含 TDO V2.0 原型归档）

## 1. 项目定义

**RINGS（年轮）** 是一款个人事务与成长管理系统。它帮助用户捕捉信息和想法、规划方向与目标、管理执行任务和习惯，并通过可视化调度工作台安排时间、执行和复盘。

品牌意象：年轮象征持续积累、时间沉淀与长期成长。

## 2. 文档体系

| 文档域 | 回答的问题 | 权威目录 |
|---|---|---|
| 项目总览 | 产品是什么、文档怎么维护 | `00-overview/` |
| 产品定义 | 做什么、业务规则是什么 | `01-product/` |
| 设计规范 | 页面如何组织、如何交互 | `02-design/` |
| 技术设计 | 系统如何实现、数据如何存储 | `03-engineering/` |
| 项目实施 | 当前做到哪里、下一步做什么 | `04-delivery/` |
| 质量与治理 | 如何验收、如何管理变更 | `05-quality/`、`06-governance/` |

## 3. 从这里开始

建议阅读顺序：
1. `00-overview/product-overview.md`
2. `00-overview/glossary.md`
3. `01-product/prd.md`
4. `01-product/domain-model.md`
5. `01-product/capability-map.md`
6. `01-product/business-rules.md`
7. `02-design/information-architecture.md`
8. `02-design/prototype-plan.md`
9. `03-engineering/architecture.md`
10. `04-delivery/roadmap.md`
11. `04-delivery/progress.md`
12. `05-quality/traceability.md`

## 4. 当前已确认的产品基线

- 品牌名称：RINGS（年轮）；TDO 只作为历史项目名称。
- 五层业务体系：捕捉层、规划层、执行层、可视化调度层、管理层。
- 捕捉层统一使用 Candidate（候选事项），包含十种固定分类。
- 候选事项分类使用“中文名称（English）”显示。
- 规划层包含 Direction（发展方向）、Goal（目标）、Stage（阶段）。
- 执行层包含 Task（任务）、Subtask（子任务）、Habit（习惯）和执行记录。
- 可视化调度层是默认首页，主要从执行层调度已确认的任务。
- 首页提供快速创建、未安排任务池和日 / 周 / 月 / 年视图。
- Task 拖入时间线创建或调整 Plan（计划），不重复创建 Task。
- Plan（计划）、Deadline（截止时间）、Calendar Event（事件）和 WorkSession（实际执行记录）必须区分。
- 文件附件与外部引用分开；文件夹引用默认保存路径，不复制或扫描整个目录。

## 5. 状态说明

- **已确认**：用户明确确认，或已经纳入当前 PRD 基线。
- **建议**：当前文档提出的设计建议，尚未得到用户最终确认。
- **待决策**：需要在技术冻结或开发前明确。
- **历史参考**：来自旧 PRD / 原型，不自动代表当前需求。
- **未验证**：没有可核验的正式代码或测试证据。

**原型可用不等于正式开发完成。** 当前确认的 `prototype.zip` 是 HTML 原型与需求资料归档，不包含正式应用源码。

## 6. 文档与产品版本

文档体系版本、PRD 版本、原型版本和软件版本分别管理，不互相替代。

## 7. 关键入口

- 产品需求：`01-product/prd.md`
- 能力地图：`01-product/capability-map.md`
- UI / UX：`02-design/ui-ux-spec.md`
- 原型计划：`02-design/prototype-plan.md`
- 首页原型 v0.7 规格：`02-design/home-dashboard-v0.7-spec.md`
- 技术架构：`03-engineering/architecture.md`
- 实施计划：`04-delivery/implementation-plan.md`
- 开发进度：`04-delivery/progress.md`
- 需求追踪：`05-quality/traceability.md`
- 决策记录：`06-governance/decision-log.md`
- 原型历史基线：`00-overview/prototype-baseline.md`

## 8. GitHub 仓库说明

本仓库的 `docs/` 目录保存本项目文档基线。原始 `prototype.zip` 已用于核验；
仓库保留可直接阅读的历史 PRD 与 HTML 原型参考，不重复提交原始二进制归档。


## 9. 最新首页原型

- 首页原型规格：02-design/home-dashboard-v0.7-spec.md
- 原型实施计划：02-design/prototype-plan.md
- 本轮开发记录：04-delivery/dev-log-2026-11-18.md

当前首页 HTML 原型版本为 v0.7，交互检查证据为 prototype_only。原型文件作为本次会话交付附件提供；本次 Git 提交同步的是规格、流程、进度和验收文档，不代表正式应用已实现。


## 10. 2026-11-18 页面合并更新

- 一级导航将“任务库”和“习惯”合并为“执行库”。
- 执行库页面内切换“全部执行 / 普通任务 / 习惯”；Task、Habit、HabitOccurrence 仍是不同领域实体。
- Candidate Pool 保持独立，十种分类与生命周期状态分开筛选。
- 新增执行库和候选事项页面规格及 HTML 原型 v0.1。
- 原型文件：prototypes/execution-candidate-v0.1/index.html。
- 当前只完成原型首轮，不代表正式应用实现。


## 11. 执行库与候选事项规格

- 执行库页面规格：docs/02-design/execution-library-v0.1-spec.md
- 候选事项页面规格：docs/02-design/candidate-pool-v0.1-spec.md
- 执行库 + 候选事项 HTML：prototypes/execution-candidate-v0.1/index.html
- 原型运行说明：prototypes/execution-candidate-v0.1/README.md
- 原型变更记录：prototypes/execution-candidate-v0.1/CHANGELOG.md

当前两个页面为首轮交互原型，尚待浏览器验收与用户评审。


## 12. 复盘中心 v1.7

- PRD 补充规格：`01-product/reflection-center-v1.7.md`
- UI / UX 规格：`02-design/reflection-center-v1.7-spec.md`
- v1.7.1 交付记录：`04-delivery/reflection-center-v1.7.1-release.md`

v1.7.0 重构周期复盘、数据分析、历史复盘和改进追踪；v1.7.1 增加本地业务变更日志。HTML 原型作为会话附件交付，状态为 prototype_only，不代表正式应用完成。


## 13. 执行库与候选事项 v0.3

- 交互规格：`02-design/execution-candidate-v0.3-spec.md`
- 交付记录：`04-delivery/execution-candidate-v0.3-release.md`
- 会话附件：`RINGS-v0.3-execution-candidate.html` 与 `RINGS-v0.3-validated-delivery.zip`

v0.3 补齐 Task / Habit 管理、按日期保存 HabitOccurrence、Candidate 备注与批量操作、显式转换、统一回收站和恢复流程。原型状态为 prototype_only；真实附件上传、数据库/API 和生产环境仍未实现。


## 14. v0.3.1 工作上下文与资料附件

- 交互规格：`02-design/execution-candidate-v0.3.1-spec.md`
- 交付记录：`04-delivery/execution-candidate-v0.3.1-release.md`
- 会话附件：`RINGS-v0.3.1-execution-context.html`、`RINGS-v0.3.1-delivery.zip`

v0.3.1 在 v0.3 基础上增加 Candidate 资料附件列表、Task Work Context 和独立专注页。附件仅为浏览器原型存储，限制 1MB / 文件、3MB / Candidate；正式文件服务尚未实现。


## 15. 规划工作区 v0.8

- 页面规格：`02-design/planning-workspace-v0.8-spec.md`
- 交付记录：`04-delivery/planning-workspace-v0.8-release.md`
- 验收记录：`05-quality/planning-workspace-v0.8-acceptance.md`

v0.8 完成 Direction / Goal / Stage 的首轮规划工作区原型，支持目标指标、阶段拆分、Task 关联、Candidate 来源追溯和 Goal 回收站。HTML 原型已提交至 `prototypes/planning-workspace-v0.8/index.html`，可下载后直接在浏览器打开；使用 localStorage 演示数据，状态为 prototype_only。


## 16. 规划工作区 v0.9（列表 + 甘特图）

- 页面规格：`02-design/planning-workspace-v0.9-spec.md`
- 交付记录：`04-delivery/planning-workspace-v0.9-release.md`
- 验收记录：`05-quality/planning-workspace-v0.9-acceptance.md`
- HTML 原型：`prototypes/planning-workspace-v0.9/index.html`

v0.9 在 v0.8 原有规划工作区中加入甘特图视图，保留列表视图为默认。Goal / Stage 使用规划日期，Task 使用 Plan 时间，Deadline 独立显示。当前为 prototype_only；正式 API、数据库和 Plan 服务联动尚未实现。


## 17. v1.0 技术方案评审

- 技术方案提案：`03-engineering/v1.0-technical-proposal.md`

该提案依据当前 PRD、领域模型、v0.9 原型和既有 Roadmap，提出 React / TypeScript / Vite、Tauri 2、Desktop SQLite、Web IndexedDB、共享 Domain / Application 与 Repository Adapter 的候选方案。当前状态为待产品确认（proposal / not frozen），不代表技术栈已冻结或正式应用已启动开发。


## 17. v1.0 技术冻结与正式项目骨架

- 技术架构：[architecture.md](03-engineering/architecture.md)
- 核心数据模型：[data-model.md](03-engineering/data-model.md)
- ADR：[adr-log.md](03-engineering/adr-log.md)
- 技术冻结记录：[v1.0-technical-proposal.md](03-engineering/v1.0-technical-proposal.md)
- 骨架交付记录：[v1.0-foundation-release.md](04-delivery/v1.0-foundation-release.md)

用户已确认 Desktop + Web 同时开发。Web 与 Desktop 共用 `apps/client`；Web 使用 IndexedDB，Desktop 使用 SQLite。v1.0 不含自动云同步。正式源码位于 `apps/` 和 `packages/`；当前仅首个 Task / Plan / WorkSession 纵向切片进入骨架，其他产品模块仍待开发。
