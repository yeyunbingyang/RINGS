# RINGS（年轮）

个人事务、目标成长与时间调度工作台。

RINGS 将信息捕捉、方向与目标规划、任务执行、可视化时间调度和周期回顾整合为一个系统。

## 文档入口

完整项目文档位于 [`docs/README.md`](docs/README.md)。

- [产品需求 PRD](docs/01-product/prd.md)
- [能力地图](docs/01-product/capability-map.md)
- [领域模型](docs/01-product/domain-model.md)
- [核心业务规则](docs/01-product/business-rules.md)
- [信息架构](docs/02-design/information-architecture.md)
- [UI / UX 规范](docs/02-design/ui-ux-spec.md)
- [执行库页面规格](docs/02-design/execution-library-v0.1-spec.md)
- [候选事项页面规格](docs/02-design/candidate-pool-v0.1-spec.md)
- [HTML 原型实施计划](docs/02-design/prototype-plan.md)
- [技术架构](docs/03-engineering/architecture.md)
- [项目路线图](docs/04-delivery/roadmap.md)
- [当前进度](docs/04-delivery/progress.md)
- [需求追踪矩阵](docs/05-quality/traceability.md)
- [决策记录](docs/06-governance/decision-log.md)

## 产品核心

- 五层业务体系：捕捉、规划、执行、可视化调度、管理。
- Candidate 统一管理尚未正式分流的候选事项。
- Direction / Goal / Stage 管理长期方向与目标。
- Task / Habit / WorkSession 管理行动、习惯和实际投入。
- 可视化调度工作台作为默认首页，支持日 / 周 / 月 / 年视图。
- Task 拖入时间线创建或调整 Plan，不重复创建 Task。
- Deadline、Plan、Calendar Event 和 WorkSession 保持独立语义。

## 项目状态

当前仓库首先建立产品需求与设计基线。文档和历史原型参考不代表正式应用代码已经实现；
开发进度以 [`docs/04-delivery/progress.md`](docs/04-delivery/progress.md) 为准。


## 最新 HTML 原型

- [执行库 + 候选事项原型 v0.1](prototypes/execution-candidate-v0.1/index.html)
- [原型运行说明](prototypes/execution-candidate-v0.1/README.md)


## 执行库与候选事项原型

- [v0.1 页面基线](prototypes/execution-candidate-v0.1/index.html)
- [v0.2 编辑增强](prototypes/execution-candidate-v0.2/index.html)
- [v0.2 运行说明](prototypes/execution-candidate-v0.2/README.md)

v0.2 增加普通任务和习惯规则编辑交互；仍是内存原型，浏览器验收待进行。


## 规划工作区 v0.8

- 页面规格：[Planning Workspace v0.8](docs/02-design/planning-workspace-v0.8-spec.md)
- 交付记录：[v0.8 release](docs/04-delivery/planning-workspace-v0.8-release.md)
- 验收记录：[v0.8 acceptance](docs/05-quality/planning-workspace-v0.8-acceptance.md)

HTML 原型已提交至 [`prototypes/planning-workspace-v0.8/index.html`](prototypes/planning-workspace-v0.8/index.html)，下载后使用 Chrome / Edge 打开即可。原型使用浏览器 localStorage 演示数据，状态为 prototype_only，不代表正式应用已实现。
