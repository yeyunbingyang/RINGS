# RINGS 数据模型设计（逻辑草案）

> 本文不是最终 SQL Schema。字段类型、索引、约束和迁移脚本需在技术方案冻结后确定。

## 1. 核心实体与字段

| 实体 | 字段建议 |
|---|---|
| Candidate | id, title, category, status, source_uri, time_info, review_at, created_at, updated_at |
| CandidateNote | id, candidate_id, content, sort_order, created_at, updated_at |
| Tag | id, name, color |
| CandidateTag | candidate_id, tag_id |
| Direction | id, title, description, status, review_cycle |
| Goal | id, direction_id, title, description, metric_type, baseline_value, target_value, unit, start_date, due_date, completion_criteria, status |
| Stage | id, goal_id, title, description, sort_order, start_date, due_date, exit_criteria, status |
| Task | id, parent_task_id, goal_id, stage_id, title, description, origin, priority, deadline, estimate_minutes, lifecycle_status, next_action |
| Habit | id, title, recurrence_rule, start_date, end_date, preferred_time, target_type, target_value, unit, status |
| HabitOccurrence | id, habit_id, occurrence_date, status, actual_value, completed_at |
| Plan | id, owner_type, owner_id, plan_date, start_at, end_at, estimated_minutes, precision, status, previous_plan_id |
| CalendarEvent | id, title, description, start_at, end_at, all_day, location, source_candidate_id |
| WorkSession | id, task_id, habit_occurrence_id, started_at, ended_at, actual_seconds |
| Thought | id, task_id, session_id, candidate_id, type, content, created_at |
| WorkContext | id, owner_type, owner_id, context_type, title, uri, note |
| Material | id, material_type, storage_mode, display_name, uri, local_path, mime_type, file_size, availability_status |
| ObjectMaterial | id, owner_type, owner_id, material_id, note, sort_order |
| Collection | id, parent_id, name, icon, color, sort_order |
| Relation | id, from_type, from_id, to_type, to_id, relation_type, created_at |

## 2. 关键约束

- Candidate.category 使用固定枚举。
- CandidateNote 独立存储，支持排序。
- Task 父子关系使用 parent_task_id。
- Task 生命周期状态与调度状态分离。
- Task 可以关联多个 Plan。
- Plan owner_type 当前建议支持 task / habit_occurrence。
- CalendarEvent 与 Task 分离。
- WorkSession 不应通过 Plan 推算实际时长。
- Material 与业务对象通过关联表连接。
- External Reference 不应保存源文件内容。

恢复版工作台的候选清单使用带稳定编号的条目。资料仍保存在候选事项的同一数组，`checklistItemId` 为空时归属事项，有值时指向一条清单。引用用途由 `role` 区分。旧文字清单及无归属资料在读取时补齐编号并默认归属事项，旧链接或路径默认是来源引用。附件仍共用单文件 1 MB、单事项 3 MB 的额度。

导入备份时暂停当前页面的工作台保存，刷新后从数据库读回已导入数据。导入失败时恢复当前页面的保存流程。

独立回收站页面沿用工作台回收快照和恢复规则。载入旧版导航配置时补入回收站入口，保留已配置的其他入口。

目标、任务、习惯和日历事件复用候选事项的标签及清单资料处理。旧记录缺少标签或清单时按空列表读取，既有资料记录沿用兼容机制。目标编辑保留目标标识与原阶段信息，删除阶段后其任务仍关联原目标。

阶段保存在目标的阶段列表，拥有稳定 ID、状态、说明、日期、完成条件以及同格式的标签、清单和资料。旧版文字和完成勾选记录在读取时标准化。删除阶段时，将清单与资料合并到目标并更新资料的清单归属，附件内容沿用现有记录。合并超额后可继续下载或移除已有文件，新附件仍受现有限额约束。
- 归档和删除采用不同策略。

## 3. 时间存储

- 时间点建议存储为明确时区语义的时间戳。
- 全天事件应使用日期语义，不强制转成 UTC 时间点。
- 展示时按用户设置时区转换。
- 重复规则需保存时区和本地时间语义。
- 计时以开始、暂停、恢复、结束事件或等效时间戳为事实来源。

## 4. 索引建议

待实现时评估 Candidate title / status / category、Task lifecycle_status / deadline / parent_task_id、Plan plan_date / start_at / end_at、WorkSession task_id / started_at、Relation 两端索引、Material availability_status 和全文搜索范围。

## 5. 待冻结问题

- Goal 指标是否采用 JSON 配置。
- Habit recurrence_rule 的表达方式。
- HabitOccurrence 采用按需生成还是预生成。
- Review 是否独立实体。
- Thought 是否允许全局记录。
- Material 与 Attachment / ExternalReference 是否拆分表。
- 删除策略、回收站和历史审计。
