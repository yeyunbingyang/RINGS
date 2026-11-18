# RINGS 规划工作区页面规格 v0.8

> 状态：交互原型首轮完成（prototype_only）；领域规则依据现有 CAP-02、PRD、业务规则和领域模型细化。尚未冻结数据库 Schema。

## 1. 目标与范围

规划工作区负责组织长期发展方向、目标结果和阶段性成果，并把 Goal / Stage 与执行层 Task 建立可追踪关联。本页面不替代执行库，也不负责 Task 的时间排期。

本轮交付：
- Direction 列表与编辑。
- Goal 列表、详情、指标、生命周期和阶段。
- Stage 创建、编辑、排序、状态与删除。
- Goal 与 Task 的关联、解除、从 Goal 创建 Task。
- Candidate 转 Goal 的来源保留示例。
- Goal 软删除、恢复和永久删除确认。

## 2. 领域边界

| 对象 | 定义 | 页面职责 |
|---|---|---|
| Direction | 长期投入或发展的领域 | 管理方向名称、说明、活跃 / 暂停 / 归档 |
| Goal | 希望达到的可描述、可衡量结果 | 管理目标说明、指标、期限、完成条件和生命周期 |
| Stage | 实现 Goal 的阶段性工作与交付 | 管理阶段说明、顺序、日期、退出标准和状态 |
| Task | 已确认承担的具体行动 | 由执行库管理；规划页只建立关联和创建入口 |

规则：
1. Direction 可以独立存在，不强制创建 Goal，也不强制设置截止日期。
2. Goal 可以不归属 Direction。
3. Goal 创建时 Stage 为可选项，可一次添加多个 Stage。
4. Stage 不自动生成 Task。
5. Stage 可以关联多个 Task；Task 可以直接关联 Goal，不强制归属 Stage。
6. 当前逻辑模型按 Task.goal_id / Task.stage_id 表达单一 Goal / Stage 归属；跨多个 Goal 的 Task 关联若有需要，需另行评审 Relation 多对多方案。
7. 临时 Task 可以完全不关联 Goal / Stage。

## 3. 页面信息架构

### 3.1 桌面布局

- 顶部：全局导航壳、当前页面、从候选事项转入、创建目标。
- 左栏：Direction 列表、全部方向入口、方向目标计数、创建 / 编辑方向。
- 中栏：Goal 列表、生命周期筛选、搜索、目标卡片。
- 右栏：选中 Goal 的说明、指标进度、完成条件、Stage 列表、关联 Task、来源 Candidate。
- 回收站：规划模块内的 Goal 恢复与永久删除入口。

### 3.2 窄屏布局

三栏降为纵向堆叠；Direction 列表压缩为两列可滚动区域；Goal 列表限制内部高度；详情区放在列表之后；表单弹窗限制视口高度，标题和操作区固定，内容区滚动。

## 4. Direction

字段：title、description、status、created_at、updated_at。

状态：
- active 活跃
- paused 暂停
- archived 归档

归档 Direction 不级联归档或删除 Goal；Goal 历史仍保留其方向关联。Direction 可独立存在。原型支持新建、编辑、暂停与归档；归档方向仍显示在方向列表中，便于重新编辑。

## 5. Goal

建议字段：direction_id、title、description、metric_type、baseline_value、current_value、target_value、unit、manual_progress、achieved、start_date、due_date、completion_criteria、status、source_candidate_id。

生命周期：
- draft 草稿
- active 进行中
- on_hold 暂停
- completed 已完成
- cancelled 已取消
- archived 已归档

目标期限建议填写，但允许留空。完成、取消、归档保持不同语义；Stage 全部完成不自动把 Goal 标记为完成。

## 6. Goal 指标与进度口径

原型提供四种衡量方式：

### 6.1 数值指标 number

字段：基线值、当前值、目标值、单位。
- 递增目标：(current - baseline) / (target - baseline)。
- 递减目标：(baseline - current) / (baseline - target)。
- 结果限制在 0%–100%。
- 基线等于目标时，仅当当前值等于目标值显示 100%，否则为 0%。

### 6.2 里程碑 milestone

- 进度 = 已完成 Stage 数 / Stage 总数。
- 没有 Stage 时显示 0%。
- 每个 Stage 当前等权；加权里程碑属于后续待决策。
- 全部 Stage 完成只表示阶段清单完成，不自动确认 Goal 完成。

### 6.3 布尔结果 boolean

由用户在 Goal 详情明确确认是否达成；不根据任务完成率自动推断。

### 6.4 自定义 custom

由用户手动输入 0–100 的进度。

### 6.5 与任务完成率分离

关联 Task 完成率作为独立执行信号显示：completed_tasks / linked_tasks。它不参与 Goal 进度计算，避免把“行动完成”误当作“结果达成”。

## 7. Stage

字段：goal_id、title、description、sort_order、start_date、due_date、exit_criteria、status。

状态：
- not_started 未开始
- in_progress 进行中
- blocked 受阻
- completed 已完成
- archived 已归档（正式状态可在后续状态矩阵中细化）

操作：创建、编辑、上移、下移、标记完成、重新打开、删除。

删除 Stage 时：不删除关联 Task；将 Task 从 Stage 解除，但保留其 Goal 关联。Stage 顺序重新编号。

## 8. Goal 与 Task 关联

支持：
1. 从 Goal 详情创建 Task，并可选择归属 Stage。
2. 从现有未归属 Task 中选择并关联。
3. Task 直接关联 Goal（不指定 Stage）。
4. 从 Goal 详情解除关联；只解除关系，不删除 Task。

新建 Task 默认进入执行库未安排任务池，不自动创建 Plan。时间安排由调度首页完成。规划工作区不复制 Task 数据，不负责 WorkSession 记录。

## 9. Candidate 转 Goal

从候选事项转入时：
- 标题、说明预填到 Goal。
- 用户可以修改目标名称和说明。
- 创建 Goal 后写入来源 Candidate 标识。
- Candidate 保留，不被删除；来源追溯在 Goal 详情显示。
- 不自动生成 Stage 或 Task。

当前原型以示例 Candidate 演示；正式版本需接入 Candidate Pool 的真实数据和字段映射预览。

## 10. 删除与恢复

- Goal 删除采用软删除，进入规划回收站。
- 删除时保存 Goal 快照、Stage 快照和 Task 关联快照。
- Task 本身不删除；删除 Goal 后暂时解除 Task 的 Goal / Stage 关联。
- 恢复 Goal 时恢复 Stage，并仅对仍存在的 Task 恢复关联。
- 永久删除需二次确认；只清除回收站 Goal 快照，不删除 Task。
- Direction 归档不级联影响 Goal。

正式应用仍需在数据库事务中实现外键约束、审计日志、并发冲突处理和跨实体恢复策略。

## 11. 交互验收清单

### Direction
- [ ] 新建、编辑、暂停、归档。
- [ ] 无 Goal 的 Direction 可以存在。
- [ ] Direction 归档不级联改变 Goal。

### Goal
- [ ] 新建、编辑、搜索、按状态筛选。
- [ ] Goal 可不归属 Direction。
- [ ] 创建 Goal 时 Stage 可选，可批量添加多条。
- [ ] 四种指标类型计算 / 更新正确。
- [ ] Goal 进度不等于 Task 完成率。
- [ ] 完成、暂停、归档、删除区分清楚。

### Stage
- [ ] 新建、编辑、删除、排序。
- [ ] Stage 状态更新影响里程碑进度。
- [ ] Stage 全部完成不自动关闭 Goal。
- [ ] 删除 Stage 不删除关联 Task。

### Task 关联
- [ ] 从 Goal 创建 Task。
- [ ] 关联现有 Task。
- [ ] Task 可直接关联 Goal 或关联 Stage。
- [ ] 解除关联不删除 Task。
- [ ] 新建 Task 默认未安排，不自动生成 Plan。

### 生命周期
- [ ] Goal 软删除进入回收站。
- [ ] 恢复还原 Stage 与仍存在的 Task 关系。
- [ ] 永久删除二次确认。

## 12. 已知限制与待决策

- 原型数据保存在浏览器 localStorage；不代表正式数据库持久化。
- Candidate 转 Goal 使用演示数据，尚未与 Candidate 原型真正联动。
- Task 数据使用本页演示样本，尚未接入执行库真实存储。
- Direction / Goal / Stage 的正式 API、事务和审计未实现。
- Stage 加权进度、Goal 多指标、一个 Task 关联多个 Goal、Goal 周期性回顾和目标历史快照待评审。
- 原型当前完成 HTML / JavaScript 静态检查；完整桌面与窄屏浏览器验收需在用户浏览器复测。
