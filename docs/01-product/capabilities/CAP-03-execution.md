# CAP-03 执行能力

> 所属层：执行层 Execution  
> 优先级：Task 核心 P0；Habit、WorkSession、Thought、WorkContext 按当前 PRD 为 P1。

## 1. 能力目标

管理用户已经确认承担的行动，支持拆分、状态推进、习惯重复、实际投入记录和工作上下文恢复。

## 2. 子能力

| 编号 | 子能力 |
|---|---|
| CAP-03-01 | Task 创建、编辑和状态管理 |
| CAP-03-02 | Subtask 拆分 |
| CAP-03-03 | Deadline、优先级和预计时长 |
| CAP-03-04 | 临时任务 |
| CAP-03-05 | Habit 重复规则 |
| CAP-03-06 | HabitOccurrence 执行记录 |
| CAP-03-07 | WorkSession 实际工作记录 |
| CAP-03-08 | Thought Stream |
| CAP-03-09 | WorkContext |

## 3. Task（任务）

定义：用户已经确认承担并决定执行的具体行动。

Task 来源：Candidate 转换、Goal / Stage 拆解、临时新增（AdHoc）、外部承诺或工作安排。

建议字段：title / description、parent_task_id、goal_id / stage_id、origin、priority、deadline、estimate_minutes、lifecycle_status、schedule_status、next_action、created_at / updated_at。

Task 可以没有 Plan，仍然是有效执行任务。

## 4. Subtask（子任务）

- 与 Task 使用同一底层结构，通过 parent_task_id 建立父子关系。
- 支持多级拆分，但默认界面应避免无限嵌套。
- 父任务进度可依据子任务、量化指标或人工判断。
- 父任务完成规则是否要求所有子任务完成，应允许配置或在产品决策中确定。
- 子任务可以独立安排 Plan 和 WorkSession。

## 5. Task 状态

生命周期状态建议：ready、in_progress、waiting、blocked、completed、cancelled、archived。

调度状态单独管理：unscheduled、planned。

`ready + unscheduled` 是正常状态，不代表遗漏。

## 6. Habit（习惯）

定义：按照重复规则持续执行的行为。

Habit 是规则；HabitOccurrence 是某次应执行或实际执行的实例。重复规则、每周次数目标、未来实例生成策略待进一步冻结。

## 7. WorkSession（工作会话）

记录实际投入时间：task_id（或 habit_occurrence_id）、started_at / ended_at、actual_seconds、pause / resume 事件、session result / note。

WorkSession 是实际记录，不等于 Plan。计时应基于时间戳校准。

## 8. Thought 与 WorkContext

Thought：记录执行过程中的思考、问题、决策、结论和下一步。

WorkContext：外部工作现场，例如 AI 会话、GitHub Repo、文件 / 文件夹、网页、终端和自定义 URI。

V2.0 原型已呈现 Thought Stream、Work Context 和 Resume 概念；当前 RINGS 将其视为执行及跨层支撑能力，具体数据归属和 UI 入口待设计。

## 9. 历史执行模式的处理

原始 PRD v1.0 提出倒计时、正计时、量词目标和纯打卡四种模式。当前 RINGS v2.2.2 没有将四种模式全部重新冻结为首版要求。

WorkSession 实际时间记录属于当前能力基线；倒计时 / 正计时 / 量词 / 纯打卡模式作为历史需求保留，是否恢复番茄钟、休息周期、量词计数和补卡规则，登记为产品待决策。

## 10. 验收要点

- [ ] Task 可独立创建，不强制关联 Goal。
- [ ] Task 可设置 Deadline、优先级和预计时长。
- [ ] Task 可拆分 Subtask。
- [ ] Task 生命周期和调度状态分离。
- [ ] Task 可以保持未安排状态。
- [ ] Habit 与 Task 使用不同业务语义。
- [ ] HabitOccurrence 可记录单次执行结果。
- [ ] WorkSession 保存实际开始、结束和投入时长。
- [ ] Thought 和 WorkContext 可关联任务或会话。
- [ ] 计时中断或应用休眠后能基于时间戳恢复。


## 11. 首页原型中的 Task 编辑细化

- 执行事项形态在当前首页交互中只提供“普通任务”和“习惯”两种。
- Task 创建和编辑表单不提供倒计时、正计时、计次、不计时等执行方式选择。
- 习惯的量化目标术语使用“量词”，具体单位由用户定义；不以“计次”作为字段名称。
- Task 支持列表式子任务添加、编辑、删除，用于拆分一个行为或较大任务。
- 未安排 Task 可以通过任务池卡片快速编辑名称、Collection、优先级、预计时长、Deadline、子任务和上下文备注。

原型状态：部分交互已在 v0.7 验证；正式 Task / Habit 数据与编辑服务未实现。
