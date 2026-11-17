# RINGS 项目实施计划

## 1. 实施原则

- 先验证用户价值最大的纵向闭环，不按五层架构机械地逐层开发。
- 产品能力、UI 设计、技术实现和测试通过 ID 关联。
- 每个开发任务必须有可验收的交付物。
- 原型完成不代表代码完成。
- 每次交付更新 PROGRESS、DEV-LOG、TRACEABILITY。

## 2. 工作包

| 工作包 | 编号 | 内容 | 前置依赖 | 交付物 |
|---|---|---|---|---|
| 产品基线 | DEV-00 | 领域模型、能力地图、待决策清理 | 当前 PRD | 评审通过的产品文档 |
| 首页设计 | DEV-UI-01 | 首页线框和 HTML 原型 | CAP-04 | 首页原型 |
| 核心交互 | DEV-UI-02 | Candidate / Task / Planning 原型 | CAP-01/02/03 | 核心页面原型 |
| 技术冻结 | DEV-ARCH-01 | 技术栈、数据、平台方案 | 产品与 UI 评审 | 架构文档和 ADR |
| 应用基础 | DEV-BASE-01 | 应用 Shell、存储、迁移 | DEV-ARCH-01 | 可启动应用 |
| 任务核心 | DEV-03-01 | Task CRUD、状态和 Subtask | DEV-BASE-01 | Task Library |
| 调度核心 | DEV-04-01 | Plan 数据和时间线 | DEV-03-01 | 基础时间线 |
| 拖放调度 | DEV-04-02 | 拖放、改期、撤销 | DEV-04-01 | 可交互调度 |
| 执行记录 | DEV-03-02 | WorkSession | DEV-03-01 | 实际执行记录 |
| 捕捉核心 | DEV-01-01 | Candidate、十种分类、备注 | DEV-BASE-01 | Candidate Pool |
| 资料引用 | DEV-X-01 | Attachment / External Reference | DEV-01-01 | 文件与路径引用 |
| 规划核心 | DEV-02-01 | Direction / Goal / Stage | DEV-BASE-01 | Planning Workspace |
| 习惯能力 | DEV-03-03 | Habit / HabitOccurrence | 技术决策 | Habit Center |
| 管理能力 | DEV-05-01 | Review / Statistics / Backup | 核心数据 | 管理页面 |
| 质量发布 | DEV-QA-01 | 测试、修复、打包 | 各能力完成 | 可发布版本 |

## 3. 建议的核心开发顺序

```text
技术方案冻结
   ↓
应用 Shell + 数据层
   ↓
Task CRUD
   ↓
未安排任务池
   ↓
Plan + 时间线
   ↓
Task 拖放和改期
   ↓
WorkSession
   ↓
端到端验收
```

这条路径优先验证 RINGS 最有辨识度的首页调度工作流。Candidate、Goal、Habit 等可以并行设计，但在核心数据结构冻结后逐步集成。

## 4. 每个开发任务的定义

每个 DEV 项必须记录 DEV ID、对应 CAP ID、对应 UI ID、前置依赖、具体范围、明确不做的内容、交付物、验收标准、实际状态、代码 / PR / Commit 链接、测试结果、风险和遗留问题。

## 5. 完成定义（Definition of Done）

开发任务只有满足以下条件才可以标记为 `verified`：
- 需求范围实现。
- 代码通过基本检查。
- 验收用例通过。
- 关键错误和空状态处理完成。
- 不破坏既有数据。
- 文档和追踪矩阵更新。
- 相关问题已关闭或明确记录。

只有实际打包发布后才可标记为 `released`。


## 6. 首页原型阶段状态（2026-11-18）

DEV-UI-01（首页线框和 HTML 原型）已完成首轮原型交付：RINGS 首页 v0.7。该项当前只代表设计与交互原型完成，证据状态为 prototype_only。

后续顺序：
1. 评审并冻结首页 v0.7。
2. 设计 Candidate Pool / 资料收藏管理。
3. 设计 Goal / Stage 和 Task 详情。
4. 冻结正式技术架构、数据模型和持久化方案。
5. 进入正式应用 Shell、数据层和核心业务开发。
