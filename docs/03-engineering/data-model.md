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
