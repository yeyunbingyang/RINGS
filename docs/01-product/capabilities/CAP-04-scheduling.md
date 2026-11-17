# CAP-04 可视化调度能力

> 所属层：可视化调度层 Visual Scheduling  
> 优先级：当前 PRD 的核心 P0 能力  
> 状态：首页定位与拖放核心交互已确认；具体视觉设计待制作。

## 1. 能力目标

把执行层中已经确认的任务安排到时间维度。可视化调度层是 RINGS 默认首页和日常操作中心。

## 2. 子能力

| 编号 | 子能力 |
|---|---|
| CAP-04-01 | 默认首页工作台 |
| CAP-04-02 | 快速创建 |
| CAP-04-03 | 未安排任务池 |
| CAP-04-04 | Task 拖放到时间线生成 Plan |
| CAP-04-05 | 日计划 |
| CAP-04-06 | 周计划 |
| CAP-04-07 | 月计划 |
| CAP-04-08 | 年度路线图 |
| CAP-04-09 | Calendar Event |
| CAP-04-10 | 改期、冲突提示和撤销 |
| CAP-04-11 | 批量调度和跨周排程 |
| CAP-04-12 | 空闲时间建议和自动重排 |

## 3. 首页主要区域

1. 顶部导航：今日 / 本周 / 本月 / 年度。
2. 快速创建：Candidate、Task、Goal、Habit、CalendarEvent、资料引用。
3. 主时间视图：显示 Plan、CalendarEvent、HabitOccurrence。
4. 未安排任务池：显示没有有效未来 Plan 的正式 Task。
5. 今日摘要：完成状态、实际投入、习惯执行和剩余任务。

## 4. 未安排任务池

应包含 ready 且没有未来有效 Plan 的 Task、已被改期但尚未重新安排的 Task，以及用户主动标记为待安排的 Task。

不应包含纯信息 Candidate、未确认转换为 Task 的候选事项和 CalendarEvent 本身。

支持搜索、筛选、排序、显示预计时长、Deadline、优先级和 Goal / Stage 归属。

## 5. Task → Plan 拖放

```text
未安排任务池中的 Task
    ↓ 拖动
目标日期或时间线
    ↓
创建或更新 Plan
    ↓
检查冲突
    ├── 无冲突 → 保存
    └── 有冲突 → 提示用户选择
    ↓
时间线更新
```

规则：
1. 拖放已有 Task 不创建重复 Task。
2. 拖放结果是创建或更新 Plan。
3. 有 estimate_minutes 时可用作默认时间块长度。
4. 没有预计时长时仍允许安排；默认时长策略待确认。
5. 可调整时间块长度。
6. 可跨日期移动和改期。
7. 冲突需提示，不静默覆盖。
8. 支持撤销。
9. 取消 Plan 不删除 Task。
10. Deadline 不因拖放而自动改变。
11. Candidate 需先确认转换为 Task，才能进入时间线。

## 6. 多时间尺度

| 视图 | 重点 | 粒度 |
|---|---|---|
| 日 | 具体执行任务和时间块 | 小时 / 时间块 |
| 周 | 将任务分配到七天、平衡工作量 | 日期 / 半天 / 时间块 |
| 月 | 月度重点、任务期限、阶段节点、事件 | 日期 / 周 |
| 年 | Direction、Goal、Stage 和里程碑 | 年 / 季度 / 月 |

不要求用户把全年计划安排到小时级。可以从年度逐步细化到日，也可以直接从今天开始。

## 7. Plan（计划）

Plan 表示对 Task 或 HabitOccurrence 的时间安排。

建议字段：owner_type / owner_id、plan_date、start_at / end_at、estimated_minutes、precision（date_only / time_block）、status、previous_plan_id。

Task 可以没有 Plan，也可以有多个 Plan。Plan 不代表实际完成。

## 8. CalendarEvent（日历事件）

示例：会议、预约、婚礼、考试、旅行、面试。

事件字段建议：title / description、start_at / end_at、all_day、location、participants、source_candidate_id、related_task_ids、reminder_rule。

事件显示在时间线上，不进入未安排任务池。事件结束不代表关联任务自动完成。外部日历同步当前不是已确认基线。

## 9. 改期和冲突

- 时间重叠时明确提示。
- 用户决定保留冲突、调整或取消。
- 不静默移动其他任务。
- Deadline 风险可提示。
- 计划调整不得覆盖历史 WorkSession。
- 支持撤销最近调度操作。

## 10. 验收要点

- [ ] 默认打开首页进入可视化调度工作台。
- [ ] 首页包含时间视图、未安排任务池和快速创建。
- [ ] 未安排任务池只包含正式 Task。
- [ ] 可拖放 Task 到日期或时间段创建 Plan。
- [ ] 拖放不创建重复 Task。
- [ ] 没有预计时长的 Task 仍可安排。
- [ ] 可调整时间块、改期和取消 Plan。
- [ ] 支持日 / 周 / 月 / 年视图。
- [ ] 年度视图使用较粗粒度，不做小时级排程。
- [ ] CalendarEvent 显示在时间线上，不进入任务池。
- [ ] Candidate 转 Task 后才可进入任务调度。
- [ ] 冲突提示、不静默覆盖、支持撤销。
- [ ] 计划调整不改写 WorkSession 历史。

## 11. 待决策

- 无预计时长 Task 的默认时间块长度。
- 首页默认显示工作时间还是全天。
- 周 / 月 / 年视图的密度和拖放规则。
- HabitOccurrence 在时间线上的默认呈现方式。
- CalendarEvent 完整管理能力的首版范围。


## 12. 首页固定布局与任务池交互补充（原型 v0.7）

- 首页头部、时间安排面板头部和任务池头部固定；只有时间轴内容和任务池列表滚动。
- 时间安排区支持全屏专注模式，Escape 可退出。
- 任务池顶部提供“添加任务”，新建任务置顶。
- 每张任务卡片提供快速编辑入口；编辑与拖拽、安排操作分离。
- 顶部导航提供快速资料收藏入口，保存为 Resource Candidate。
- 滚动条使用统一细窄样式，默认弱化、悬停增强。
- 创建 Goal 时可选建立 Stage。
- Calendar Event 开始时间必填，结束时间可在事件结束后补录。
- Task 创建后可按“未安排 / 已安排”进入不同的下一步安排流程。

原型状态：v0.7 已完成首轮 Chromium 交互检查（prototype_only）；正式应用功能未验证。
