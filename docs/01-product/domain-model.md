# RINGS 领域模型

> 状态：逻辑领域模型；不是已冻结的数据库 DDL。

## 1. 核心实体

| 实体 | 中文名称 | 所属层 | 职责 |
|---|---|---|---|
| Candidate | 候选事项 | 捕捉 | 尚未正式分流的统一事项对象 |
| CandidateNote | 候选备注 | 捕捉 | 一条 Candidate 的多条备注记录 |
| Tag | 标签 | 管理 | 用户自定义标记 |
| CandidateTag | 候选标签关联 | 管理 | Candidate 与 Tag 多对多关系 |
| Material | 补充资料 | 跨层 | 附件元数据或外部引用元数据 |
| Direction | 发展方向 | 规划 | 长期投入和发展领域 |
| Goal | 目标 | 规划 | 有衡量方式的预期结果 |
| Stage | 阶段 | 规划 | 目标过程中的阶段性工作 |
| Task | 任务 | 执行 | 已确认承担的行动 |
| Habit | 习惯 | 执行 | 重复规则定义 |
| HabitOccurrence | 习惯执行实例 | 执行 | 某一次应执行或实际执行的习惯 |
| Plan | 计划 | 调度 | 对 Task 或 HabitOccurrence 的时间安排 |
| CalendarEvent | 日历事件 | 调度 | 实际发生的时间事项 |
| WorkSession | 工作会话 | 执行 | 实际投入时间记录 |
| Thought | 思考记录 | 跨层 | 任务 / 会话相关的思考、问题、决策 |
| WorkContext | 工作上下文 | 跨层 | 文件夹、网页、Repo、AI 会话等工作入口 |
| Collection | 分类目录 | 管理 | 按项目、领域或主题组织对象 |
| Relation | 对象关联 | 管理 | 不同业务对象之间的显式关联 |
| Review | 回顾记录 | 管理 | 周期性复盘内容（是否独立实体待技术设计） |

## 2. 核心关系

```text
Candidate 1 ── N CandidateNote
Candidate N ── N Tag
Candidate N ── N Material

Direction 1 ── N Goal
Goal 1 ── N Stage
Goal 1 ── N Task（允许直接关联）
Stage 1 ── N Task

Task 1 ── N Subtask（Task 自关联）
Task 1 ── N Plan
Task 1 ── N WorkSession
Task 1 ── N Thought
Task 1 ── N WorkContext
Task N ── N Material

Habit 1 ── N HabitOccurrence
HabitOccurrence 1 ── N Plan
HabitOccurrence 1 ── N WorkSession

CalendarEvent N ── N Task（可选关联）
Candidate 0..1 ── 1 转换目标对象（保留来源映射）
Candidate N ── N 其他业务对象（通过 Relation）
```

## 3. 关键语义

- Candidate 是尚未决定或尚未正式承诺的事项；Task 是已确认要执行的行动。
- Candidate 的 category 说明类型，status 说明生命周期状态。
- Goal 表示结果，Stage 表示目标过程中的阶段，Task 表示具体行动。
- Habit 是重复规则；HabitOccurrence 是单次实例。
- Deadline 是最晚完成时间；Plan 是预定执行时间；CalendarEvent 是事件发生时间；WorkSession 是实际投入时间。
- Material 偏参考资料；WorkContext 偏执行现场。两者可以指向同一 URI，但用途不同。

## 4. 生命周期建议

Candidate：`new → reviewing → retained / incubating / converted / archived / dismissed`

Task：`ready → in_progress → completed`，并可存在 `waiting`、`blocked`、`cancelled`、`archived`。

Task 调度状态单独管理：`unscheduled / planned`。

归档是可恢复的生命周期操作，不等同于物理删除。

## 5. 尚未冻结的领域问题

- Candidate 十种分类是否严格单选。
- 一个 Task 是否可以关联多个 Stage。
- Goal 指标和进度的计算模型。
- HabitOccurrence 的生成策略。
- WorkSession 是否允许无 Task 的自由专注。
- Review 是否需要独立持久化实体。
- Material 的内部附件与外部引用是否拆分为两个表。
