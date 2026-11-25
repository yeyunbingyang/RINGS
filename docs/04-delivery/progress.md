# RINGS 项目进度

> 截止日期：2026-11-20  
> 状态来源：当前可核验的文档与原型文件。不把原型交互当作正式开发完成。

## 2026-11-22 工作台变更

- 新增「回顾与管理 → 开发地图」，已采用方案 3，在变更清单中筛选和选择记录，在详情中查看前后对照、反馈返工和验收经过。
- 规划和执行管理页的统计卡片移至页头。
- 「复盘」与「统计」拆为「工作区」内的独立页面，分别设置周期，变更记入开发地图。

## 1. 总体状态

| 工作流 | 当前状态 | 说明 |
|---|---|---|
| 品牌与产品定位 | 已确认 | RINGS（年轮） |
| 产品需求基线 | 已建立 | RINGS PRD v2.2.2 |
| 文档体系拆分 | 首版已建立 | 本文档包 v1.0.0 |
| 原型历史基线 | 已核验 | prototype.zip 中 V2.0 已恢复并校验 |
| RINGS UI / UX 原型 | 首轮完成（prototype_only） | 首页 v0.7；候选事项 + 执行库 v0.1 |
| 技术架构冻结 | 未开始 | 技术栈和数据方案未冻结 |
| 正式开发 | 未验证 | prototype.zip 不含正式源码 |
| 首页 v0.7 原型交互检查 | 已验证（prototype_only） | Chromium 检查首页 Task 创建 / 编辑 / 置顶、快速收藏、弹窗适配；不是正式应用自动化测试 |
| Candidate / 执行库 v0.1 原型验收 | 待进行 | 本轮新增页面尚未提供浏览器自动化验收证据 |
| HTML / JavaScript 静态检查 | 已通过 | v0.1 / v0.2 内嵌 JavaScript 语法解析通过；v0.2 任务与习惯编辑按钮已接入编辑表单；不代表浏览器布局或交互验收 |
| 软件发布 | 未开始 / 未验证 | 无正式发布版本证据 |

## 2. 文档整理状态

| 项目 | 状态 |
|---|---|
| 项目总览 | 首版已建立 |
| 术语表 | 首版已建立 |
| 原型基线分析 | 已建立 |
| PRD 拆分版 | 首版已建立 |
| 领域模型 | 首版已建立，待评审 |
| 能力地图 | 首版已建立，待评审 |
| 业务规则 | 首版已建立，待评审 |
| UI / UX 规范 | 已更新首轮页面规范 |
| 技术架构 | 初稿，未冻结 |
| 实施计划 | 初稿 |
| 测试与追踪 | 首版模板已建立 |

## 3. 当前推进顺序

1. 评审 Candidate Pool 与执行库 v0.1 的页面结构、字段和对象边界。
2. 对新增页面进行桌面端、窄屏和主要交互的浏览器验收。
3. 明确 HabitOccurrence 的生成、补记录、跳过和统计规则。
4. 补齐 Candidate 转 Goal / Direction / CalendarEvent 的完整表单，以及 Task / Habit 编辑交互。
5. 设计规划工作区与 Goal / Stage 详情。
6. 页面评审通过后冻结数据模型、存储和 API。
7. 开始 Task → Plan → WorkSession 纵向开发闭环。

## 4. 更新记录

| 日期 | 更新 |
|---|---|
| 2026-11-17 | 建立 RINGS 项目文档体系 v1.0.0；核验 prototype.zip；整理产品、设计、技术、实施和质量文档初稿 |

## 5. 更新规则

每次开发合并或版本交付后更新 CAP 能力状态、DEV 实施状态、TEST 验收状态、当前阻塞问题、版本号和交付链接。


## 6. 2026-11-18 原型进度更新

| 工作项 | 状态 | 说明 |
|---|---|---|
| RINGS 首页 HTML 原型 | 已完成首轮 v0.7（prototype_only） | 固定工作区、时间轴与任务池独立滚动、全屏专注、任务池顶部新增和卡片快速编辑、顶部快速资料收藏 |
| 创建流程细化 | 原型已验证（prototype_only） | Goal 可选 Stage；Calendar Event 结束时间可事后补录；Task 创建后区分未安排和已安排的下一步 |
| 原型交互检查 | 已完成（prototype_only） | Chromium 检查 Task 创建 / 编辑 / 置顶、快速收藏、弹窗尺寸、桌面与手机布局；无 JavaScript 运行错误 |
| Candidate Pool | 首轮 v0.1 已上传（prototype_only） | 十种分类、生命周期、捕捉、详情和转换入口 |
| 执行库（Task + Habit） | v0.2 已上传（prototype_only） | 单一入口，页面内切换普通任务与习惯；已补普通任务与习惯规则编辑，Occurrence 历史待补 |
| 正式技术架构与数据持久化 | 未开始 / 未冻结 | 当前原型数据不持久化 |
| 正式应用开发 | 未验证 | 不能以 HTML 原型交互替代正式源码 |
| 正式自动化测试 | 未开始 / 未验证 | 当前没有正式应用测试套件 |

## 7. 首页 v0.7 原型验证边界

- 浏览器：Chromium。
- 视口：桌面 1440×900；窄屏 390×844。
- 已检查：Task 创建后置顶、任务卡片快速编辑、快速资料收藏、任务池顶部入口、弹窗视口适配、手机端无横向溢出、JavaScript 无运行错误。
- 前一轮 v0.6 已检查：Goal 子阶段添加、Calendar Event 结束时间事后补录、下一步排期分支和全屏专注退出。
- 当前证据级别：prototype_only。
- 未验证：正式数据库持久化、API、权限、数据迁移、生产构建、跨浏览器兼容和正式应用 E2E。

## 8. 下一步建议

1. 评审 Candidate Pool 与执行库 v0.1 的页面结构、字段和对象边界。
2. 对新增 HTML 页面进行桌面端、窄屏和主要交互的浏览器验收。
3. 明确 HabitOccurrence 的生成、补记录、跳过和统计规则。
4. 补齐 Candidate 转 Goal / Direction / CalendarEvent 的完整表单，以及 Task / Habit 编辑交互。
5. 设计规划工作区与 Goal / Stage 详情。
6. 页面评审通过后冻结数据模型、存储和 API，再进入正式应用开发。


## 9. 2026-11-18 执行库与候选事项原型更新

| 交付项 | 状态 | 说明 |
|---|---|---|
| 执行库页面规格 | 已建立 | docs/02-design/execution-library-v0.1-spec.md |
| 候选事项页面规格 | 已建立 | docs/02-design/candidate-pool-v0.1-spec.md |
| 执行库 + 候选事项 HTML | 已上传（prototype_only） | prototypes/execution-candidate-v0.1/index.html |
| 信息架构与一级导航 | 已更新 | 任务库、习惯合并为执行库入口；领域实体保持独立 |
| 交互流程与 UI / UX | 已更新 | 新增执行库创建、习惯记录、Candidate 回顾和转换流程 |
| 决策与需求追踪 | 已更新 | 新增 DEC-029 至 DEC-033 和原型验收项 |

本轮新增原型已通过 HTML 结构标记与内嵌 JavaScript 语法静态检查，但未提供浏览器自动化验收证据。页面内存演示数据不等于数据库持久化；不将原型状态升级为 code_complete。


## 10. 执行库编辑增强 v0.2

| 工作项 | 状态 | 说明 |
|---|---|---|
| 普通任务编辑 | 已加入原型 | 可编辑名称、说明、优先级、预计时长、Deadline、Collection 和子任务 |
| 习惯规则编辑 | 已加入原型 | 可编辑名称、说明、重复规则与量词目标 |
| 状态保留 | 已加入原型 | 编辑不会重置任务状态或习惯今日状态 |
| 量词校验 | 已加入原型 | 数值与单位必须同时填写或同时留空 |
| 浏览器验收 | 待进行 | 需要实际验证打开编辑、保存、取消、移动端弹窗与交互错误 |
| HabitOccurrence 历史 | 待实现 | 当前仍为单一今日状态演示，不是按日期记录的历史实例 |

v0.2 文件：prototypes/execution-candidate-v0.2/index.html。


## 11. 2026-11-18 复盘中心 v1.7.1

| 工作项 | 状态 | 说明 |
|---|---|---|
| 复盘中心 PRD | 已完成（文档基线） | 每周优先；数据分析独立标签；任务、习惯、目标、时间安排全部纳入 |
| 周期复盘 UI | 原型已完成（prototype_only） | 每日 / 每周 / 每月 / 自定义周期；五步复盘表单；草稿与完成状态 |
| 数据分析 | 原型已完成（prototype_only） | Task / Plan 分离；计划时间 / Session 时间分离；精确 / 估算 / 未记录分离 |
| 历史复盘与改进追踪 | 原型已完成（prototype_only） | 独立 Review 记录、快照、改进项状态 |
| 业务事件历史 | 原型已完成（prototype_only） | Task、Plan、Habit、Goal、Candidate 轻量变更日志 |
| 历史数据迁移 | 已加入兼容逻辑（prototype_only） | v1.6 / v1.5 / v1.4 读取；载入旧数据建立基线，不伪造事件 |
| 浏览器冒烟验收 | 已通过（prototype_only） | Node 语法检查；Chromium 桌面 / 390px 窄屏；主要标签、周期、草稿、事件日志检查 |
| 正式应用 / 数据库 | 未验证 | 当前仍为独立 HTML 原型；无正式后端、数据库事务或跨设备审计 |

本次原型附件：`RINGS-v1.7.1-reflection-center.html`；完整包：`RINGS-v1.7.1-reflection-center.zip`。正式应用开发状态不因原型验收而升级。


## 12. 2026-11-18 执行库与候选事项 v0.3

| 工作项 | 状态 | 说明 |
|---|---|---|
| Task 生命周期 | 原型已完成（prototype_only） | 准备就绪、进行中、等待、阻塞、完成、取消、归档；调度状态独立 |
| HabitOccurrence | 原型已完成（prototype_only） | 按日期记录完成、跳过、未完成、量词和备注 |
| Candidate 管理 | 原型已完成（prototype_only） | 十种分类、生命周期、搜索、备注、批量归档和标签 |
| Candidate 转换 | 原型已完成（prototype_only） | 显式选择 Task / Goal / Direction / CalendarEvent；保留来源关系 |
| 统一回收站 | 原型已完成（prototype_only） | Task / Habit / Candidate 软删除、恢复和永久删除确认 |
| Chromium 冒烟验收 | 已通过（prototype_only） | 新建 Task / Candidate、转换、习惯按日期记录、备注、软删除 / 恢复 |
| 390px 窄屏 | 已通过（prototype_only） | 页面无横向溢出 |
| 正式应用 / 数据库 | 未验证 | 无正式数据库、API、事务或跨设备同步 |

原型规格：`docs/02-design/execution-candidate-v0.3-spec.md`。HTML 原型通过会话附件交付；当前仓库同步需求规格与进度记录，不把原型验收等同正式应用完成。


## 13. 2026-11-18 v0.3.1 工作上下文与资料附件增量

| 工作项 | 状态 | 说明 |
|---|---|---|
| Candidate 资料列表 | 原型已完成（prototype_only） | 支持拖放、剪贴板粘贴、文件选择、排序、移除与下载 |
| Task Work Context | 原型已完成（prototype_only） | 支持 AI 会话、本地文件 / 文件夹、GitHub Repo、网页等引用 |
| Task 专注页 | 原型已完成（prototype_only） | 专注计时、Thought 记录、结束时生成 WorkSession 摘要 |
| Chromium 冒烟验收 | 已通过（prototype_only） | 文件选择、上下文添加、专注计时和记录、390px 窄屏 |
| 本机附件存储 | 已实现 | 文件流式写入 `data/attachments/`，大小不设上限；工作台 JSON 仅保存引用；浏览器原型模式仍受 localStorage 配额限制 |

v0.3.1 会话附件：`RINGS-v0.3.1-execution-context.html` 与 `RINGS-v0.3.1-delivery.zip`。文件拖放 / 剪贴板在目标桌面浏览器仍需用户环境复测。


## 14. 2026-11-18 规划工作区 v0.8

| 工作项 | 状态 | 说明 |
|---|---|---|
| Direction 页面交互 | 原型首轮完成（prototype_only） | 新建、编辑、暂停、归档；方向可独立存在 |
| Goal 页面交互 | 原型首轮完成（prototype_only） | 创建、编辑、搜索、状态筛选、指标更新、归档 |
| Goal 指标 | 原型首轮完成（prototype_only） | 数值、里程碑、布尔、自定义；与 Task 完成率分离 |
| Stage 管理 | 原型首轮完成（prototype_only） | 可选创建、编辑、排序、状态更新、删除 |
| Goal / Task 关联 | 原型首轮完成（prototype_only） | 直接关联 Goal 或归属 Stage；支持创建与关联已有 Task |
| Candidate 转 Goal | 原型首轮完成（prototype_only） | 演示数据转换，保留来源 Candidate 标识 |
| Goal 删除与恢复 | 原型首轮完成（prototype_only） | 软删除、阶段和 Task 关系快照、恢复、永久删除确认 |
| HTML / JavaScript 静态检查 | 已通过 | HTML 结构解析与 Node.js 语法检查 |
| 浏览器交互与窄屏验收 | 待用户复测 | 当前没有可核验的完整浏览器 E2E 结果 |
| 正式数据库 / API | 未实现 | 原型 localStorage 不等于正式持久化 |

交付附件：RINGS-v0.8-planning-workspace.html；交付包：RINGS-v0.8-planning-workspace-delivery.zip。详细规格与验收记录见 planning-workspace-v0.8-spec.md 和 planning-workspace-v0.8-acceptance.md。

## 15. 下一步

用户评审 v0.8 规划工作区原型，确认 Goal 指标口径和 Stage 规则；之后进入技术方案冻结，明确数据 Schema、存储、事务、迁移和桌面 / Web 平台适配，再决定正式开发顺序。


## 15. 2026-11-20 规划工作区 v0.9（列表 + 甘特图）

| 工作项 | 状态 | 说明 |
|---|---|---|
| v0.8 列表工作区保留 | 已验证（prototype_only） | Direction / Goal / Stage / Task 三栏结构保留 |
| 列表 / 甘特图切换 | 已验证（prototype_only） | 列表为默认视图 |
| 甘特图时间尺度 | 已验证（prototype_only） | 周 / 月 / 季 / 年 |
| Goal / Stage 时间条 | 已验证（prototype_only） | 修改日期不级联影响子项 |
| Task Plan 可视化 | 已验证（prototype_only） | 支持多个 Plan；Plan 与 Task 分离 |
| Deadline 独立标记 | 已验证（prototype_only） | 不随 Plan 自动改期 |
| Task 拖入时间轴创建 Plan | 事件处理已检查（prototype_only） | 不复制 Task；真实桌面拖放仍建议用户复测 |
| Plan 取消与 Task 保留 | 已验证（prototype_only） | 无其他有效 Plan 时回到未排期池 |
| 390 / 768 / 1440px 布局 | 已验证（prototype_only） | 页面无横向溢出 |
| HTML / JavaScript 静态检查 | 已通过 | HTML 结构与 node --check |
| 正式 API / 数据库 / Plan 服务 | 未实现 | 当前仍是 localStorage 原型 |

交付文件：`prototypes/planning-workspace-v0.9/index.html`；规格、交付和验收文档分别位于 `docs/02-design/`、`docs/04-delivery/`、`docs/05-quality/`。原型验收不等同正式应用完成。


## 16. 2026-11-20 v1.0 技术方案评审启动

| 工作项 | 状态 | 说明 |
|---|---|---|
| 当前仓库源码核验 | 已完成 | 当前仓库以 docs / prototypes 为主，尚无正式应用源码 |
| v0.9 原型基线核验 | 已完成 | 列表 + 甘特图；localStorage；prototype_only |
| v1.0 技术方案提案 | 已提交评审 | `docs/03-engineering/v1.0-technical-proposal.md` |
| 技术栈冻结 | 待用户确认 | React / TypeScript / Vite、Tauri 2 候选方案 |
| 首发平台范围 | 待用户确认 | Windows Desktop 优先，或 Desktop + Web 同时首发 |
| Web 数据策略 | 待用户确认 | IndexedDB 本地存储，首版通过导入 / 导出交换数据；不包含云同步 |
| Plan 冲突策略 | 待用户确认 | 默认提示冲突，不自动重排；是否允许确认后保存重叠安排 |
| 正式应用源码 | 未开始 | 等技术决策确认后建立最小可运行骨架 |

### 下一步门槛

先确认首发平台范围。平台范围确定后，冻结 ADR 与 Repository / Migration 设计，再建立应用骨架和 Task → Plan → WorkSession 纵向闭环。未确认前不把候选技术方案标记为已冻结，也不把原型 localStorage 当作正式数据层。

## 17. 2026-11-21 ToolOrbit 本机应用首版

ToolOrbit 本机工作台复用已验收的界面，通过回环 HTTP 和版本化 SQLite 快照保存。先交付单机使用。首启可新建空白工作台，或经确认导入同地址的原型数据。应用记录、设置和附件从数据库读取，浏览器存储用于识别旧数据。

已验证空白初始化、Task → Plan → WorkSession 闭环、甘特图改期不改变截止日、停服换端口后恢复记录，以及旧窗口写入拒绝和导入前副本。当前版本采用本机服务共用数据库，历史技术提案中的独立 Tauri 应用、React 改写、实体表结构和独立 Web 离线存储仍在后续方案范围内。

## 18. 2026-11-24 执行管理优化

本机工作台已实现独立任务管理和甘特图、未完成默认筛选、继承标签统计、任务及子任务的完成和回收操作，以及目标、阶段、任务的自动与手动排序。

Windows 独立 WebUI 已用临时 SQLite 工作台验证父子状态筛选、标签去重、历史详情、完成及恢复、父子任务回收、刷新后手动顺序、目标及阶段开始日期排序，以及甘特图排期写回。工作台存储与附件测试通过。ToolOrbit 内嵌页使用独立数据验证了父子任务创建、完成筛选、重开持久化、子任务回收恢复和甘特图入口。

任务管理列表随后改为默认显示全部、已完成项置底，在行内展示目标和阶段、排期和执行时间。有标记完成事件时单独显示其时间。已在独立 WebUI 和 ToolOrbit 内嵌页验证。

任务管理采用已选的归属树表。已在 Windows 独立 WebUI 及 ToolOrbit 内嵌页验证层级折叠、搜索展开、时间列、已完成置底、树内排序、详情抽屉和窄窗口布局。

按反馈调整完成任务的树表组织。已完成任务留在原分支，在同级末尾按「已完成」默认折叠，展开后显示浅绿色。已在独立 WebUI 及 ToolOrbit 内嵌页验证。

挂起事项改为独立页面，侧栏保留入口和数量。关联任务默认折叠，每次只展开一张卡片。已在 Windows 独立 WebUI 和 ToolOrbit 内嵌页验证导航、快速新增、详情跳转、取消挂起和保存结果。

定时复盘支持配置日、周、月规则。Windows 独立 WebUI 已验证到点生成 15 分钟任务及排期、同周期去重、暂停继续、刷新恢复倒计时，以及提交联动。桌面内嵌验收启动受执行策略拦截。
