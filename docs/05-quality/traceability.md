# RINGS 需求追踪矩阵（Traceability）

> 当前为规划映射。UI、DEV、TEST 项尚未代表已经实现。

## 1. 核心能力追踪

| CAP ID | 产品能力 | UI ID | DEV ID | TEST ID |
|---|---|---|---|---|
| CAP-01-01 | 快速捕获 Candidate | UI-01-01 | DEV-01-01 | TEST-01-01 |
| CAP-01-02 | 十种分类和标签 | UI-01-01 | DEV-01-02 | TEST-01-02 |
| CAP-01-03 | 多条备注 | UI-01-02 | DEV-01-03 | TEST-01-03 |
| CAP-01-06 | 附件和外部引用 | UI-01-02 | DEV-X-01 | TEST-X-01 |
| CAP-01-09 | Candidate 转换 | UI-01-02 | DEV-01-04 | TEST-01-04 |
| CAP-02-01 | Direction | UI-02-01 | DEV-02-01 | TEST-02-01 |
| CAP-02-02 | Goal | UI-02-02 | DEV-02-02 | TEST-02-02 |
| CAP-02-04 | Stage | UI-02-02 | DEV-02-03 | TEST-02-03 |
| CAP-03-01 | Task 管理 | UI-03-01 | DEV-03-01 | TEST-03-01 |
| CAP-03-02 | Subtask | UI-03-01 | DEV-03-02 | TEST-03-02 |
| CAP-03-05 | Habit | UI-03-02 | DEV-03-03 | TEST-03-03 |
| CAP-03-07 | WorkSession | UI-03-03 | DEV-03-04 | TEST-03-04 |
| CAP-04-01 | 首页工作台 | UI-04-01 | DEV-04-01 | TEST-04-01 |
| CAP-04-03 | 未安排任务池 | UI-04-01 | DEV-04-02 | TEST-04-02 |
| CAP-04-04 | Task → Plan 拖放 | UI-04-02 | DEV-04-03 | TEST-04-03 |
| CAP-04-05 | 日视图 | UI-04-02 | DEV-04-04 | TEST-04-04 |
| CAP-04-06 | 周视图 | UI-04-03 | DEV-04-05 | TEST-04-05 |
| CAP-04-07 | 月视图 | UI-04-04 | DEV-04-06 | TEST-04-06 |
| CAP-04-08 | 年度路线图 | UI-04-05 | DEV-04-07 | TEST-04-07 |
| CAP-04-09 | CalendarEvent | UI-04-02 | DEV-04-08 | TEST-04-08 |
| CAP-05-04 | 归档与恢复 | UI-05-01 | DEV-05-01 | TEST-05-01 |
| CAP-05-05 | Review | UI-05-02 | DEV-05-02 | TEST-05-02 |
| CAP-05-06 | Statistics | UI-05-03 | DEV-05-03 | TEST-05-03 |
| CAP-05-07 | Backup / Export | UI-05-04 | DEV-05-04 | TEST-05-04 |

## 2. 核心闭环追踪

| 步骤 | 能力 | UI | 开发任务 | 验收 |
|---|---|---|---|---|
| 创建 Task | CAP-03-01 | UI-03-01 / UI-04-01 | DEV-03-01 | TEST-03-01 |
| 进入未安排池 | CAP-04-03 | UI-04-01 | DEV-04-02 | TEST-04-02 |
| 拖放创建 Plan | CAP-04-04 | UI-04-02 | DEV-04-03 | TEST-04-03 |
| 开始 WorkSession | CAP-03-07 | UI-03-03 | DEV-03-04 | TEST-03-04 |
| 完成并回顾 | CAP-05-05 | UI-05-02 | DEV-05-02 | TEST-05-02 |

## 3. 追踪规则

- 每个已确认 CAP 至少有一个验收标准。
- 每个 UI 交互必须追溯到 CAP 或业务规则。
- 每个 DEV 任务必须关联 CAP 和验收条件。
- 每个 TEST 用例必须关联需求或缺陷。
- 需求取消或变更时，更新所有下游关联。
