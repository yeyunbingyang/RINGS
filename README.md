# RINGS（年轮）

个人事务、目标成长与时间调度工作台。

RINGS 将信息捕捉、方向与目标规划、任务执行、可视化时间调度和周期回顾整合为一个系统。

## 在 ToolOrbit 中使用

文档和历史原型导入自 [yeyunbingyang/RINGS](https://github.com/yeyunbingyang/RINGS/tree/b6791c595c59f1be04d96946610888b28cca9e3e)。本机工作台沿用恢复版界面。在 ToolOrbit 的「插件」页打开 `productivity-RINGS`，或运行 `productivity-RINGS.bat` 选择「启动」。需要 Node.js 24 或更新版本。

首次打开时可建立空白工作台。如果当前浏览器的同一地址存在原型记录，启动界面也会提供导入选项。其他地址的原型记录可先从旧工作台导出 JSON，再在「设置」导入。

本机服务、ToolOrbit 托管入口和开发预览默认共用插件的 `data/rings.sqlite`。更换同一台电脑上的浏览器或端口会读取同一份工作台。设置可导出完整 JSON，导入前需确认并保留最近一次导入前副本。长期备份可导出 JSON，或在关闭全部 RINGS 实例后备份数据目录。插件启动日志和本机运行实例日志沿用现有入口。

在 ToolOrbit 根目录运行 `node node_modules/vite/bin/vite.js --config plugins/bundled/productivity-RINGS/script/preview.config.mjs`，在 18761 查看热更新预览。测试可通过 `RINGS_DATA_DIR` 指定独立运行数据目录。

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


## HTML 原型

当前保留的原型是恢复版工作台：[入口页面](prototypes/workspace-recovery/index.html) 与 [甘特图视图](prototypes/workspace-recovery/gantt.html)。本机 ToolOrbit 工作台沿用该界面基线。原型使用浏览器 localStorage 演示数据，状态为 prototype_only，不代表正式应用已实现。

早期 HTML 原型文件（执行库 / 候选事项 v0.1、v0.2，规划工作区 v0.8、v0.9）已从仓库移除；对应的页面规格、交付与验收文档仍保留在 `docs/` 中作为设计历史记录。


## 规划工作区 v0.8 文档

- 页面规格：[Planning Workspace v0.8](docs/02-design/planning-workspace-v0.8-spec.md)
- 交付记录：[v0.8 release](docs/04-delivery/planning-workspace-v0.8-release.md)
- 验收记录：[v0.8 acceptance](docs/05-quality/planning-workspace-v0.8-acceptance.md)


## 规划工作区 v0.9（列表 + 甘特图）

- 原有 v0.8 Direction / Goal / Stage / Task 列表工作区完整保留。
- 新增列表视图 / 甘特图视图切换；甘特图支持周 / 月 / 季 / 年尺度。
- Task 时间条读取 Plan；Deadline 独立显示；一个 Task 可以拥有多个 Plan。
- 页面规格：[docs/02-design/planning-workspace-v0.9-spec.md](docs/02-design/planning-workspace-v0.9-spec.md)
- 交付记录：[docs/04-delivery/planning-workspace-v0.9-release.md](docs/04-delivery/planning-workspace-v0.9-release.md)
- 验收记录：[docs/05-quality/planning-workspace-v0.9-acceptance.md](docs/05-quality/planning-workspace-v0.9-acceptance.md)

状态：prototype_only。原型使用浏览器 localStorage，不代表正式 API / 数据库已实现。


## RINGS v1.0 正式应用骨架（Desktop + Web）

v1.0 采用双端同时开发：Web 与 Desktop 共用 `apps/client` React SPA、Domain 和 Application；Desktop 由 Tauri 2 加载同一前端。

### 本地启动

环境要求：Node.js 22.12+、pnpm 10+；运行 Desktop 还需要 Rust 1.90+ 和 Tauri 对应系统构建依赖。

```bash
pnpm install
pnpm dev:web
```

桌面端：

```bash
pnpm dev:desktop
```

构建：

```bash
pnpm build:web
pnpm build:desktop
```

### 双端数据说明

- Web：IndexedDB。
- Desktop：SQLite。
- 两端当前分别本地保存，**没有云同步或自动跨端数据同步**。
- 首次 `pnpm install` 会生成 pnpm-lock.yaml；依赖锁文件需要随安装验证结果提交。

### 当前正式代码范围

当前 foundation 切片打通 Task 创建 / 完成 / 软删除 / 恢复、Plan 创建 / 取消 / 冲突提示、WorkSession 开始 / 结束和双端本地 Repository Adapter。其他页面入口仍在后续接入计划中，不能把原型能力视为正式代码完成。
