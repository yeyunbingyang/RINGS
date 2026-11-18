# RINGS 执行库与候选事项交互规格 v0.3

> 版本：v0.3；状态：交互原型已完成 Chromium 冒烟验收（prototype_only）。正式应用尚未实现。

## 1. 范围

本版本聚焦执行库、候选事项和统一数据生命周期。保留既有 RINGS 信息架构和领域模型，不进行全局视觉重构。

## 2. 领域边界

- Task：用户已经确认承担的行动，可以没有 Plan。
- Habit：重复执行规则，不是 Task。
- HabitOccurrence：某日期的一次习惯执行实例。
- Candidate：尚未正式分流的想法、任务线索、问题、资料等。
- Plan 是时间安排；WorkSession 是实际投入记录。
- Candidate 转换后保留来源记录与目标对象关系。

## 3. 执行库

### 3.1 Task

字段：标题、说明、优先级、预计时长、Deadline、Collection、Tag、Subtask、生命周期状态、调度状态、关联历史摘要。

生命周期：ready（准备就绪）、in_progress（进行中）、waiting（等待）、blocked（阻塞）、completed（已完成）、cancelled（已取消）、archived（已归档）。

调度状态：unscheduled（未安排）、planned（已安排）。

规则：
1. ready + unscheduled 是正常状态。
2. 新建任务默认未安排。
3. 完成、取消、归档、删除是不同操作。
4. 取消 Plan 不删除 Task。
5. 编辑不得重置任务状态、子任务完成情况或历史关联。
6. 删除先进入回收站；不得静默级联删除 Plan / WorkSession。

### 3.2 Habit 与 HabitOccurrence

Habit 规则字段：名称、说明、重复规则、执行日、量词目标（数值 + 单位）、状态。

HabitOccurrence 字段：日期、状态、实际量词、备注。

状态：待记录、已完成、跳过、未完成。

规则：
- 每个日期独立保存，不用今日状态覆盖历史。
- 补录必须指定日期。
- 跳过与未完成必须区分。
- 量词数值与单位同时填写或同时留空。
- 修改规则不得覆盖历史实例。
- Habit 规则不进入普通 Task 未安排池；具体实例后续可接入调度层。

## 4. Candidate

十种分类：备忘（Memo）、资料（Resource）、想法（Idea）、愿望（Wish）、待办种子（Task Candidate）、问题（Issue）、待决策（Decision）、承诺（Commitment）、事件（Event）、等待（Waiting）。

生命周期：new（新收集）、reviewing（待澄清）、retained（已保留）、incubating（孵化中）、converted（已转换）、archived（已归档）、dismissed（已取消）。

分类回答“是什么”；状态回答“现在如何”。

支持编辑、搜索、备注新增 / 删除、分类和状态筛选、批量归档、批量添加 Tag。批量转换暂不开放。

## 5. Candidate 转换

可转换目标：Task、Goal、Direction、CalendarEvent。转换必须由用户明确选择并确认。标题、内容、标签可预填；转换后 Candidate 保留，记录目标类型和目标引用。Event 分类不自动等于 CalendarEvent；Candidate 不直接进入未安排任务池。

## 6. 删除、归档和恢复

| 操作 | 语义 | 可恢复 |
|---|---|---|
| 完成 | 任务达成 | 可重新打开 |
| 取消 | 不再执行 / 处理 | 可重新打开或重新处理 |
| 归档 | 保留但退出默认列表 | 可恢复 |
| 删除 | 软删除并进入回收站 | 可恢复 |
| 永久删除 | 清除对象记录 | 不可恢复 |

软删除保存原对象快照、类型、删除时间和关联摘要。恢复还原原对象字段与可用关系。永久删除必须二次确认并说明影响范围。删除 Candidate 不级联删除转换生成的正式对象；删除 Task 不静默清除历史 Plan / WorkSession。

## 7. 页面结构

- 执行库：统一入口；内部切换全部执行、普通任务、习惯；任务与习惯各自展示字段与筛选。
- 候选事项：左侧分类 / 状态筛选，中间列表与批量操作，右侧详情、备注和转换关系。
- 回收站：统一管理 Task、Habit、Candidate，支持恢复与永久删除。

## 8. 验收记录

- [x] Task 新建，默认未安排。
- [x] Candidate 新建与转换为 Task。
- [x] 转换后 Candidate 保留来源关系。
- [x] Habit 按指定日期新增执行记录。
- [x] Candidate 备注新增。
- [x] Task / Candidate 软删除与恢复。
- [x] Chromium 桌面与 390px 窄屏冒烟；无横向溢出。
- [x] Node JavaScript 语法检查；pageerror 为 0。

测试环境对 localStorage 做了内存适配以便在受限浏览器沙箱中运行；用户直接打开 HTML 时仍使用浏览器 localStorage。

## 9. 明确未实现

真实附件拖放 / 剪贴板文件上传与存储、正式数据库/API、跨设备同步、服务端事务、审计日志、自动生成完整 HabitOccurrence 时间序列、正式 Goal / Direction / CalendarEvent 页面及生产 E2E。
