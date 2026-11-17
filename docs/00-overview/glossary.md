# RINGS 统一术语表

> 用户可见业务名称统一使用“中文名称（English）”。代码字段和枚举值可使用英文。

## 1. 候选事项十种分类

| 用户界面名称 | 英文标识 | 定义 |
|---|---|---|
| 备忘（Memo） | `memo` | 未来可能需要查阅的信息 |
| 资料（Resource） | `resource` | 外部内容及其来源 |
| 想法（Idea） | `idea` | 尚未形成明确执行方案的创意或思路 |
| 愿望（Wish） | `wish` | 想做、想体验或想获得，但目前没有承诺 |
| 待办种子（Task Candidate） | `task_candidate` | 已能描述具体行动，但尚未正式承诺执行 |
| 问题（Issue） | `issue` | 发现的问题、故障、风险或障碍 |
| 待决策（Decision） | `decision` | 尚未确定选择，需要比较或权衡 |
| 承诺（Commitment） | `commitment` | 自己答应别人或别人委托自己处理的事项 |
| 事件（Event） | `event` | 有明确发生时间或时间范围的事项 |
| 等待（Waiting） | `waiting` | 等待外部回复、审核、交付或条件满足 |

## 2. 核心业务对象

| 中文名称（English） | 定义 |
|---|---|
| 候选事项（Candidate） | 捕捉层统一事项对象，尚未正式分流或尚未决定是否执行 |
| 分类（Category） | Candidate 的十种固定分类之一 |
| 标签（Tag） | 用户自定义的补充标记 |
| 发展方向（Direction） | 长期希望投入、提升或发展的领域 |
| 目标（Goal） | 有衡量方式和预期期限的结果 |
| 阶段（Stage） | 实现目标过程中的阶段性工作 |
| 任务（Task） | 已确认承担并决定执行的行动 |
| 子任务（Subtask） | Task 的子级行动 |
| 习惯（Habit） | 按重复规则持续执行的行为定义 |
| 习惯执行实例（HabitOccurrence） | 某一次应执行或实际执行的习惯实例 |
| 计划（Plan） | 对 Task 或 HabitOccurrence 的时间安排 |
| 截止时间（Deadline） | 行动最晚必须完成的时间约束 |
| 日历事件（Calendar Event） | 实际发生在某个时间或时间范围的事件 |
| 工作会话（WorkSession） | 实际工作或专注的时间记录 |
| 思考记录（Thought） | 与任务或工作会话相关的思考记录 |
| 工作上下文（WorkContext） | 执行时需要访问的外部工作现场 |
| 补充资料（Material） | 关联到业务对象的附件或外部资源引用 |
| 外部引用（External Reference） | 仅保存 URL、URI 或文件路径，不复制源文件 |
| 附件（Managed Attachment） | 由 RINGS 管理存储副本的文件 |
| 归档（Archive） | 暂时退出日常管理，可恢复的生命周期操作 |

## 3. 时间语义

| 中文名称 | 字段建议 | 含义 |
|---|---|---|
| 截止时间（Deadline） | `deadline_at` | 最晚完成期限 |
| 计划开始（Plan Start） | `start_at` | 预定开始执行时间 |
| 计划结束（Plan End） | `end_at` | 预定结束执行时间 |
| 事件时间（Event Time） | `event_start_at` / `event_end_at` | 事件实际发生时间 |
| 提醒时间（Reminder Time） | `reminder_at` | 提醒用户查看或处理 |
| 跟进时间（Follow-up Time） | `follow_up_at` | 重新检查等待事项的时间 |
| 回顾时间（Review Time） | `review_at` | 重新评估候选事项的时间 |
| 实际执行时间（Actual Time） | WorkSession 时间戳 | 实际投入时间 |

## 4. 状态边界

- Candidate 的 `category` 说明“它是什么”。
- Candidate 的 `status` 说明“它现在处于什么生命周期状态”。
- Task 的生命周期状态与调度状态分开。
- Task 可以是 `ready + unscheduled`，这是正常状态。
- Waiting Candidate 与 Task `waiting` 状态语义不同。
- Candidate 的“事件（Event）”分类与正式“日历事件（Calendar Event）”是不同对象。
