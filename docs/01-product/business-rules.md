# RINGS 核心业务规则

## 1. Candidate 与 Task

1. Candidate 是尚未正式分流、尚未确认执行的事项。
2. Task 是已经确认承担并决定执行的行动。
3. Candidate 可以长期保留，不要求转换。
4. Task 可以直接创建，不要求必须来自 Candidate。
5. Candidate 转 Task 后保留来源关系和原始内容。
6. 有截止时间不自动等于 Task；判断依据是是否存在明确行动责任。
7. Candidate 不直接进入未安排任务池；转换为 Task 后才可以。

## 2. 分类与状态

1. Candidate 默认一个主要分类，可叠加自定义 Tag。
2. 分类说明“是什么”，状态说明“现在如何”。
3. 十种候选事项分类使用中文名称（English）。
4. 等待（Waiting）作为 Candidate 分类与 Task 的 `waiting` 状态不是同一概念。
5. 问题（Issue）是候选事项分类；执行任务被阻塞时可关联 Issue。

## 3. Candidate Event 与 CalendarEvent

1. Candidate 的事件（Event）表示捕获到的事件线索或待整理事件。
2. CalendarEvent 表示已确认发生时间的日历事件。
3. CalendarEvent 不自动变成 Task。
4. CalendarEvent 可以关联准备任务或后续任务。
5. 事件时间不等于任务 Deadline。

## 4. Direction / Goal / Stage / Task

1. Direction 表示长期发展方向，可以没有期限。
2. Goal 表示可衡量的结果，原则上设置目标期限。
3. Stage 是实现 Goal 的阶段性工作，不等于任务。
4. Stage 可以关联多个 Task。
5. Task 可以直接关联 Goal，不强制归属 Stage。
6. 临时任务可以不关联任何 Direction / Goal / Stage。
7. Stage 完成不自动等于 Goal 完成。
8. Goal 进度不能简单等于 Task 完成率。

## 5. Habit 与 Task

1. Habit 是重复规则，不是一个永久 Task。
2. HabitOccurrence 是某一次习惯执行实例。
3. Habit 可以独立存在，也可以关联 Direction / Goal / Stage。
4. 习惯未打卡不自动等于普通 Task 逾期。
5. HabitOccurrence 可以被安排为 Plan 并记录 WorkSession，具体生成策略待决策。

## 6. Task 与 Plan

1. Task 表示行动内容，Plan 表示执行时间安排。
2. Task 可以没有 Plan，进入未安排任务池。
3. Task 可以有一个或多个 Plan。
4. 拖动 Task 到时间线只创建或更新 Plan，不重复创建 Task。
5. Plan 可以只指定日期，也可以指定具体时间块。
6. Plan 取消不删除 Task。
7. 任务从时间线移回任务池，取消未来安排，不删除 Task。
8. 时间冲突需要提示，不静默覆盖其他计划。
9. 计划调整不覆盖 WorkSession 历史。
10. 规划甘特图是 Goal / Stage / Task Plan 的可视化视图，不新增独立 Gantt 领域对象。
11. Goal / Stage 日期调整只修改当前对象，不自动级联修改子对象或关联 Task。
12. Task 在甘特图中的时间条读取 Plan；一个 Task 可以拥有多个 Plan，每条 Plan 独立显示和编辑。
13. Plan 变更不覆盖 Deadline；Deadline 变更不修改 Plan。
14. 在甘特图未排期池中拖动 Task，只创建 Plan，不复制 Task。
15. 取消 Plan 不删除 Task；当 Task 没有其他有效 Plan 时，重新进入未排期任务池。

## 7. Deadline / Plan / WorkSession

- Deadline：最晚完成时间。
- Plan：预计执行时间。
- WorkSession：实际投入时间。

计划时间与实际时间分开统计。延期改期不得修改已发生的 WorkSession。

## 8. 时间尺度

| 尺度 | 主要内容 | 粒度 |
|---|---|---|
| 年 | Direction、Goal、Stage、里程碑 | 年 / 季度 / 月 |
| 月 | 月度重点、阶段节点、任务期限、事件 | 日期 / 周 |
| 周 | 任务分配、工作负载、事件 | 日期 / 半天 / 时间块 |
| 日 | 具体执行安排 | 小时 / 时间块 |

年度计划不要求小时级排程。用户可从任意尺度开始安排，不强制先创建年度计划。

## 9. 附件与外部引用

1. Managed Attachment 是由 RINGS 管理的文件副本。
2. External Reference 只保存 URL / URI / 路径。
3. 添加外部引用不得自动复制或上传源文件。
4. 文件夹引用默认不递归扫描，不建立全目录索引。
5. 外部路径失效时保留记录并允许重新定位。
6. Desktop 可在授权范围内打开本地路径；Web 不承诺任意访问本地绝对路径。
7. 解除关联、删除 RINGS 副本和删除用户原始文件是不同操作。

## 10. 生命周期

- 完成、取消、归档、删除是不同操作。
- 归档可恢复，不等于删除。
- Candidate 池不要求每日清空。
- 对象转换后保留来源和必要历史。
- 任何破坏性操作应明确反馈并提供合理恢复机制。

## 11. 首页调度规则

1. 默认首页是可视化调度工作台。
2. 未安排任务池只包含正式执行 Task，不混入纯信息 Candidate。
3. 首页可以快速创建 Candidate、Task、Goal、Habit 和 CalendarEvent。
4. Candidate 拖到时间线时，必须先确认转换为 Task。
5. CalendarEvent 显示在时间线上，但不进入未安排任务池。
6. 首页显示习惯执行实例，不把 Habit 规则本身当成单次任务。
