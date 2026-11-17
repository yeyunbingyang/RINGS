# RINGS 产品需求总览（PRD）v2.2.2 拆分版

> 状态：当前需求基线的结构化总览。详细功能要求分别维护在 `capabilities/` 中。  
> 来源：RINGS PRD v2.2.2。

## 1. 产品定位

RINGS（年轮）是一款面向个人知识工作、生活事务和长期成长的管理工具。产品将信息捕捉、目标规划、任务执行、时间调度和回顾管理整合为一个系统。

## 2. 产品范围

### 2.1 当前基线内

- Candidate 统一候选事项池及十种分类。
- 多条备注、标签、时间信息和补充资料。
- 文件、文件夹和网页外部引用。
- Direction / Goal / Stage 规划体系。
- Task / Subtask 正式执行任务。
- Habit / HabitOccurrence 习惯体系。
- WorkSession 实际执行记录。
- WorkContext / Thought 思考与工作上下文。
- 默认首页可视化调度工作台。
- 未安排任务池、Task → Plan 拖放。
- 日 / 周 / 月 / 年不同时间尺度。
- Collection、Tag、Relation、归档、回顾、统计、备份和导出。

### 2.2 当前未冻结或暂缓

- 云同步和多设备同步。
- 外部日历双向同步。
- AI 自动分类或自动转换。
- AI 自动读取本地目录或自动上传文件。
- 自动重排用户全部日程。
- 艾宾浩斯 / SM2 记忆复习。
- 更复杂的 Gantt 独立页面。
- 系统托盘、悬浮窗和全局快捷键的完整范围。
- 最终技术栈、正式数据库和 API 结构。

## 3. 五层业务架构

| 层级 | 主要职责 | 能力编号 |
|---|---|---|
| 捕捉层 | 统一捕获、分类和澄清 Candidate | CAP-01 |
| 规划层 | 管理 Direction / Goal / Stage | CAP-02 |
| 执行层 | 管理 Task / Subtask / Habit / WorkSession | CAP-03 |
| 可视化调度层 | 默认首页、时间线和任务安排 | CAP-04 |
| 管理层 | 关联、归档、回顾、统计、备份 | CAP-05 |

## 4. 核心业务边界

- Candidate 不等于 Task。
- Goal 是结果，Task 是行动。
- Stage 是阶段性工作，不等于任务清单。
- Habit 是重复规则，HabitOccurrence 是单次实例。
- Plan 是安排，WorkSession 是实际执行。
- Deadline 是完成期限，不是计划开始时间。
- Candidate 分类“事件（Event）”与正式 Calendar Event 不同。
- “等待（Waiting）”既可以是 Candidate 分类，也可以是 Task 状态，语义不同。

## 5. 首页要求

可视化调度层是默认首页，核心包含：
- 今日 / 本周 / 本月 / 年度视图。
- 快速创建入口。
- 已安排任务时间线。
- 未安排 Task 池。
- 习惯执行和日历事件。
- 任务拖放和改期。
- 从计划开始 WorkSession。

拖放已有 Task 只创建或调整 Plan，不创建重复 Task，也不自动修改 Deadline。

## 6. 非功能要求

- Desktop / Web 共用领域模型和核心业务规则。
- 本地优先；云同步不是当前基线。
- Desktop 可在授权范围内打开本地文件和文件夹。
- Web 不承诺任意访问用户设备的本地绝对路径。
- 不未经用户同意读取、复制、移动或上传外部文件。
- 数据导出和备份纳入首版技术方案。
- 计时通过时间戳校准，避免休眠或页面挂起导致计时漂移。
- 删除、归档和恢复需要有明确区别。

## 7. 当前版本优先级

以下优先级沿用 v2.2.2，不等于实际 Sprint 排期。

- **P0：** Candidate 核心、规划核心、Task / Subtask、基础生命周期、首页调度工作台、快速创建、未安排任务池、Task 拖放、基础日 / 周 / 月 / 年视图。
- **P1：** Habit / HabitOccurrence、WorkSession、Calendar Event、等待与阻塞跟进、WorkContext、Thought Stream、Review / Statistics、批量调度和年度路线图增强。
- **P2：** 复杂习惯规则、自动进度计算、阶段模板、智能延期重排、记忆复习、托盘 / 悬浮窗、AI 辅助、多端同步。

## 8. 详细需求入口

- 领域模型：`domain-model.md`
- 能力地图：`capability-map.md`
- 业务规则：`business-rules.md`
- 具体功能：`capabilities/CAP-01-capture.md` 至 `CAP-05-management.md`
- 待决策：`../06-governance/decision-log.md`
