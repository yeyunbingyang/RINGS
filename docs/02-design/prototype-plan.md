# RINGS HTML 原型实施计划

> 目标：以用户确认的 `prototype.zip` 为历史基线，制作符合 RINGS v2.2.2 领域模型的新一代 HTML 交互原型。

## 1. 原型定位

HTML 原型用于验证信息架构、页面布局、核心交互、业务对象边界和用户流程。HTML 原型不是正式产品源码，不代表数据库、API 或生产功能已经实现。

## 2. 历史基线

`prototype.zip` 内的 V2.0 是历史高保真原型。它展示 Today、Task Library、Planning、Timeline、Statistics、Review、Focus、Record Inbox、Ideas、Work Context、Thought Stream 等模块。

新原型应继承有价值的工作流和交互概念，但按 RINGS 新领域模型重组，不直接把旧导航和旧数据对象照搬。

## 3. 建议原型阶段

### Proto-01：RINGS 首页工作台

验证今日 / 本周 / 本月 / 年度切换、快速创建、主时间线、未安排任务池、Task 拖放、时间块调整、冲突提示和今日摘要。

### Proto-02：Candidate Pool 与详情

验证十种分类筛选、快速捕捉、多条备注、补充资料、网页 / 文件 / 文件夹引用和 Candidate 转换。

### Proto-03：规划工作区

验证 Direction 列表、Goal 详情、Stage 拆分、Task 与 Stage 关联、目标指标和进度呈现。

### Proto-04：任务库与任务详情

验证 Task / Subtask、状态、Deadline 与 Plan 区分、WorkSession、Thought、WorkContext。

### Proto-05：习惯与执行模式

验证 Habit 规则、HabitOccurrence 和执行记录。是否恢复倒计时 / 正计时 / 量词 / 纯打卡模式，需先完成产品决策。

### Proto-06：复盘与管理

验证 Review、Statistics、Collection / Tag、归档和恢复、备份入口。

## 4. 原型验收场景

- 用户打开软件首先看到调度首页。
- 用户可以从首页快速创建一个未安排 Task。
- 用户可以把 Task 拖入今天的某个时间段。
- 拖放只创建 Plan，不重复创建 Task。
- 用户可以将任务移到其他日期。
- 用户可以从 Candidate 详情添加文件夹引用。
- 用户可以把 Candidate 转为 Task 并保留来源。
- 用户可以从 Goal / Stage 创建 Task。
- 用户可以从计划时间启动 WorkSession。

## 5. 交付规范

每次原型交付应包含 HTML、assets（如有）、README、CHANGELOG、原型版本号、日期、已验证流程和已知限制。

## 6. 当前状态

- V2.0 历史原型：已归档并恢复校验。
- RINGS 新首页原型：未开始。
- RINGS 新 Candidate / Planning / Execution 页面：未开始。
- 当前视觉设计系统：待确定。
