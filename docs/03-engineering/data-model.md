# RINGS v1.0 核心数据模型

> 状态：v1.0 foundation 物理 Schema 已建立；其余领域实体仍按 PRD 保留为逻辑模型，尚未建表。

## 1. 本轮已落地实体

| 实体 | Web 存储 | Desktop 存储 | 说明 |
|---|---|---|---|
| Task | IndexedDB `tasks` | SQLite `tasks` | 正式执行事项 |
| Plan | IndexedDB `plans` | SQLite `plans` | 预定时间安排 |
| WorkSession | IndexedDB `workSessions` | SQLite `work_sessions` | 实际执行记录 |

## 2. Task

字段：
- `id`：稳定 ID。
- `parentTaskId`：可选父任务 ID。
- `goalId` / `stageId`：可选规划关联；当前预留字段，目标和阶段表尚未纳入首个 migration。
- `title`、`description`。
- `priority`：low / normal / high / urgent。
- `status`：open / in_progress / blocked / completed / cancelled / archived。
- `deadlineAt`：独立截止时间。
- `estimateMinutes`：可选预计耗时。
- `createdAt`、`updatedAt`。
- `deletedAt`：软删除时间；为空表示未删除。

约束：
1. 标题不能为空。
2. 任务生命周期状态不等于调度状态。
3. 删除通过设置 `deletedAt`，不物理删除行。
4. 恢复清空 `deletedAt`，不重建任务 ID。
5. Task 被软删除时，相关 Plan 和 WorkSession 保留。

## 3. Plan

字段：
- `id)、`taskId)。
- `planDate)：用户本地日历日期（YYYY-MM-DD）。
- `startAt)、`endAt)：ISO 8601 UTC 时间点；日期级计划可为空，但必须同时为空。
- `timezone)：IANA 时区。
- `status)：planned / cancelled / completed。
- `previousPlanId)：可选的接续来源。
- `createdAt)、`updatedAt)。

约束：
1. 一个 Task 可有多个 Plan。
2. 开始和结束时间必须同时填写或同时为空。
3. 若有时间点，endAt 必须晚于 startAt。
4. 取消 Plan 仅更新状态；不删除 Task。
5. Deadline 不属于 Plan，也不由 Plan 自动修改。
6. 拖动时间条应更新同一个 Plan ID。

## 4. WorkSession

字段：
- `id)、`taskId)。
- `startedAt)、`endedAt)。
- `actualSeconds)。
- `createdAt)、`updatedAt)。

约束：
1. WorkSession 是实际投入记录，不由 Plan 推算。
2. 同一个 Task 同时最多存在一条 endedAt 为空的 Session。
3. 结束时间不得早于开始时间。
4. 已结束记录不得被再次结束覆盖。
5. 删除 Task 不级联删除 WorkSession。

## 5. SQLite Migration

首个 migration：`apps/desktop/src-tauri/migrations/0001_core.sql`。

包含：
- tasks、plans、work_sessions 三张表。
- 外键约束和检查约束。
- 常用查询索引。
- 每个 Task 单条活动 WorkSession 的部分唯一索引。

Migration 由 Tauri SQL Plugin 在连接 `sqlite:rings.db` 时应用，版本号由插件管理。Web IndexedDB 使用数据库版本号 1 建立对应 object stores。

## 6. 删除策略

| 操作 | Task | Plan | WorkSession |
|---|---|---|---|
| 移入回收站 | 设置 deletedAt | 保留 | 保留 |
| 恢复 | 清空 deletedAt | 保留 | 保留 |
| 取消计划 | 不变 | status=cancelled | 不变 |
| 永久删除 | v1.0 暂不开放 | 不级联删除 | 不级联删除 |

## 7. 逻辑模型中尚未物理落地的实体

Candidate、CandidateNote、Material、ObjectMaterial、Direction、Goal、Stage、Habit、HabitOccurrence、CalendarEvent、Thought、WorkContext、Review、Collection、Relation 等仍按产品 PRD 和既有领域模型规划。

它们不属于本轮 migration，不应因为出现在领域文档中就被认为已经完成数据库实现。

## 8. 时间存储

- 时间点：ISO 8601 UTC。
- 日期：YYYY-MM-DD，保留本地日期语义。
- 时区：IANA Time Zone。
- 计时：开始 / 结束时间戳作为事实来源；actualSeconds 为结束时计算并持久化的结果。
