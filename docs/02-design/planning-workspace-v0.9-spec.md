# RINGS 规划工作区页面规格 v0.9

> 状态：交互原型完成（prototype_only）。v0.9 在 v0.8 原有规划工作区上增加甘特图视图，不替换列表视图，不改变 Direction / Goal / Stage / Task / Plan 的领域边界。

## 1. 版本目标

在原有规划工作区增加“列表视图 / 甘特图”切换，使用户既能维护方向、目标、阶段和任务关联，也能从时间轴观察规划周期和执行安排。

本版本是规划工作区的视图增强，不建设独立甘特业务对象，不取代调度首页。

## 2. 页面结构

### 2.1 保留的列表视图

完整保留 v0.8 三栏结构：
- 左栏：Direction 发展方向列表。
- 中栏：Goal 列表、状态筛选、搜索。
- 右栏：Goal 指标、完成条件、Stage、关联 Task、来源 Candidate。
- 规划回收站继续保留。

列表视图仍是默认视图。切换到甘特图不会清除当前列表筛选和选中目标。

### 2.2 新增甘特图视图

- 页面顶部增加“列表视图 / 甘特图”切换。
- 甘特图左侧为事项树，右侧为横向日期时间轴。
- Direction 作为分组行，不绘制时间条。
- Goal 使用 `startDate → dueDate` 绘制规划周期。
- Stage 使用 `startDate → dueDate` 绘制阶段周期。
- Task 按关联关系显示在 Stage 下方，或直接显示在 Goal 下方。
- Task 的每个有效 Plan 单独绘制为一个时间条；同一 Task 可显示多个 Plan。
- Task Deadline 使用独立菱形标记，不与 Plan 时间条合并。
- 当前日期使用竖线标识。

## 3. 时间尺度与筛选

- 时间尺度：周、月、季度、年。
- 支持上一时间段、下一时间段和回到今天。
- 支持按 Direction、Goal 状态和关键词筛选。
- 支持全部层级、目标 + 阶段、仅目标三种密度。
- Goal 可展开 / 收起 Stage 和关联 Task。
- 支持展开全部 / 收起全部。
- 甘特图以日期为粒度，不在本版本提供小时级时间块编辑。

## 4. 拖动与编辑规则

| 对象 | 拖动主体 | 拖动左边缘 | 拖动右边缘 |
|---|---|---|---|
| Goal | 仅移动 Goal 开始 / 结束日期 | 调整开始日期 | 调整目标期限 |
| Stage | 仅移动 Stage 开始 / 结束日期 | 调整开始日期 | 调整阶段期限 |
| Task Plan | 仅移动当前 Plan | 调整 Plan 开始日期 | 调整 Plan 结束日期 |
| Task Deadline | 拖动菱形调整 Deadline | — | — |

约束：
1. Goal 日期变更不级联修改 Stage 或 Task。
2. Stage 日期变更不级联修改关联 Task。
3. Task Plan 变更不修改 Task Deadline。
4. Deadline 变更不修改 Plan。
5. 取消 Plan 不删除 Task；Task 在没有有效 Plan 时重新进入未排期事项池。
6. Task 可以有多个 Plan；拖动某一条只修改该 Plan。

## 5. 未排期事项池

甘特图底部显示未排期事项：
- Goal / Stage 缺少完整起止日期时显示在池中；拖入时间轴补充其规划日期。
- 没有有效 Plan 的未完成 Task 显示在池中；拖入时间轴创建 Plan，不复制 Task。
- 拖动 Goal / Stage 只修改其自身日期。
- 拖动 Task 创建独立 Plan，Task 内容与 Deadline 保持不变。

## 6. 原型数据与兼容

- 沿用 v0.8 localStorage key：`rings-planning-v08`，避免切换版本时丢失已有浏览器演示数据。
- 对旧数据执行非破坏性迁移：若不存在 `plans` 集合，则补充空数组；不覆盖已有方向、目标、阶段、任务、候选事项和回收站。
- 原型 Plan 结构：`id`、`taskId`、`startAt`、`endAt`、`status`。
- Plan 结构只是原型演示数据，不等于正式数据库 DDL。
- 初始示例中为已标记 planned 的样例 Task 配置一条演示 Plan；用户已有 localStorage 数据不会被注入示例 Plan。
- 当前版本不新增独立 Milestone 实体；Goal 的 milestone 指标仍按现有 Stage 完成情况计算。

## 7. 非目标与限制

- 不替代默认调度首页。
- 不实现正式 API / 数据库 / 云同步。
- 不实现冲突检测、自动重排、撤销 / 重做。
- 不实现依赖关系连线、关键路径、资源负载、基线对比。
- 不提供小时级编辑；日期视图将 Plan 时间折叠到日期范围。
- localStorage 仅用于浏览器原型验证，不代表正式持久化。
