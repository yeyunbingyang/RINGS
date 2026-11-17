# RINGS HTML 原型实施计划

> 目标：以用户确认的 `prototype.zip` 为历史基线，制作符合 RINGS v2.2.2 领域模型的新一代 HTML 交互原型。

## 1. 原型定位

HTML 原型用于验证信息架构、页面布局、核心交互、业务对象边界和用户流程。HTML 原型不是正式产品源码，不代表数据库、API 或生产功能已经实现。

## 2. 历史基线

`prototype.zip` 内的 V2.0 是历史高保真原型。它展示 Today、Task Library、Planning、Timeline、Statistics、Review、Focus、Record Inbox、Ideas、Work Context、Thought Stream 等模块。

新原型应继承有价值的工作流和交互概念，但按 RINGS 新领域模型重组，不直接把旧导航和旧数据对象照搬。

## 3. 原型阶段与状态

### Proto-01：RINGS 首页工作台

状态：首轮 v0.7 已完成（prototype_only）。

验证内容：今日 / 本周 / 本月 / 年度切换、固定工作区头部、时间轴与任务池独立滚动、时间安排区域全屏专注、任务池顶部新增与卡片快速编辑、顶部快速收藏资料、Goal 可选建立 Stage、Calendar Event 结束时间事后补录。

### Proto-02：Candidate Pool 与详情

状态：首轮 v0.1 已上传（prototype_only）。

验证内容：十种分类筛选、独立生命周期状态、快速捕捉、搜索与排序、备注、标签、外部引用、跟进时间、保留 / 孵化 / 归档 / 取消与转换入口。

### Proto-03：执行库（Task + Habit）

状态：首轮 v0.1 已上传（prototype_only）。

验证内容：一个执行库入口、全部执行 / 普通任务 / 习惯视图、普通任务状态筛选与子任务、习惯重复规则与量词、HabitOccurrence 单次记录、与首页未安排任务池的对象边界。

### Proto-04：规划工作区

状态：待设计。

验证 Direction 列表、Goal 详情、Stage 拆分、Task 与 Stage 关联、目标指标和进度呈现。

### Proto-05：复盘与管理

状态：待设计。

验证 Review、Statistics、Collection / Tag、归档恢复和备份入口。

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

## 5. 当前原型文件

| 页面 | 文件 | 版本 | 状态 |
|---|---|---|---|
| 首页工作台 | 首页 v0.7 规格与历史交付记录 | v0.7 | 首轮完成 |
| 候选事项 + 执行库 | prototypes/execution-candidate-v0.1/index.html | v0.1 | 首轮完成 |
| 规划工作区 | 待创建 | — | 待设计 |
| 复盘与管理 | 待创建 | — | 待设计 |

原型运行说明见 prototypes/execution-candidate-v0.1/README.md。

## 6. 交付规范

每次原型交付应包含 HTML、assets（如有）、README、CHANGELOG、原型版本号、日期、已验证流程和已知限制。

## 7. 后续顺序

1. 评审首页 v0.7、Candidate Pool v0.1、执行库 v0.1 的页面边界与字段。
2. 明确 HabitOccurrence 生成与统计规则。
3. 补齐 Candidate 转 Goal / Direction / CalendarEvent 的完整转换表单。
4. 补齐 Task / Habit 编辑表单、执行历史和状态边界。
5. 依据确认后的页面冻结领域关系、存储和 API。
6. 进入正式应用开发与测试。

## 8. 历史状态

- V2.0 历史原型：已归档并恢复校验。
- RINGS 首页工作台 v0.7：首轮完成（prototype_only）。
- Candidate Pool v0.1：首轮完成（prototype_only）。
- 执行库 v0.1：首轮完成（prototype_only）。
- 规划工作区、复盘与管理：待设计。
- 当前视觉设计系统：待确定。
