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
