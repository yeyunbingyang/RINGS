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


## 未归属与习惯

已关联目标的任务在「目标拆解」按所属目标和阶段管理。「未归属与习惯」的列表和任务统计只包含尚无目标的任务，并保留习惯管理。通过调度或挂起事项打开单项任务时，可直接查看子任务、排期与执行记录。

## 12. v0.3 执行库生命周期补充

- 执行库是 Task 与 Habit 的统一管理入口，不合并领域实体。
- Task 生命周期状态：ready、in_progress、waiting、blocked、completed、cancelled、archived。
- Task 调度状态独立：unscheduled / planned；新建 Task 默认未安排。
- Habit 是重复规则；HabitOccurrence 是某日期的一次执行实例。
- HabitOccurrence 支持已完成、跳过、未完成、实际量词和备注；历史按日期保存，不由今日状态覆盖。
- Habit 规则编辑不得覆盖历史记录；量词数值与单位必须同时填写或同时留空。
- 删除 Task / Habit 采用软删除；不得因删除而静默级联清除 Plan、WorkSession 或历史记录。
- v0.3 原型已覆盖主要交互，正式数据层与自动生成实例策略仍待实现 / 决策。


## 13. v0.3.1 Work Context 与专注页

- Task 详情可关联 AI 会话、本地文件 / 文件夹、GitHub Repo、网页和其他上下文引用。
- 专注页以 Task 为当前执行对象，展示专注计时和 Thought / 工作记录输入。
- 结束专注时生成 WorkSession 摘要；不得自动将 Task 标记为 completed。
- 暂停、异常中断恢复和跨设备计时仍需正式技术设计与验收。

## 快速开始与结束

普通任务可在未安排任务池、执行管理，或从规划阶段新建后立即开始。立即开始保存实际开始时间，并打开调度日视图。用户点击「完成并结束」时保存结束时间并计算耗时。执行管理的任务卡片和详情可直接点「中断」。中断只结束当前执行片段，仍保留任务及排期。用「已中断」筛选找回任务，点「继续」开始新片段。间隔时间不计入实际耗时。快速开始记录在刷新或关闭页面后保留，直到用户主动暂停或结束。专注页原有的中断恢复规则继续适用其专注记录。

## 子任务实际执行

普通任务详情内可以逐项开始、暂停或完成子任务，也可选择并行。开始时保存时间戳，暂停及完成时计算这一片段的耗时。子任务完成后保留父任务状态，父任务仍由用户确认完成。正在执行的子任务须先结束，才能完成或归档父任务。父任务实际占用时间按父任务自身及子任务片段的并集计算。

## 任务取消与状态显示

普通任务的列表和详情用带颜色、图标与文字的状态标签区分执行状态，列表左边缘同步标记颜色。未开始、进行中或已阻塞的任务可从执行详情取消。取消会结束任务正在执行的片段，并取消任务和子任务尚未完成的排期。任务、子任务、执行片段与历史排期保留。父任务有正在执行的子任务时，须先暂停或完成该子任务。可按「已取消」筛选并重新激活，恢复本次取消的排期。
