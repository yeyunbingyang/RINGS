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
- 工作台取消任务沿用 `cancelled`。仍在执行的片段写入结束时间与实际时长。未完成的任务及子任务排期标为 `cancelled`，记录原 `statusBeforeTaskCancel` 供重新激活恢复。旧排期字段保持兼容，独立取消的计划保留原状态。
- Material 与业务对象通过关联表连接。
- External Reference 不应保存源文件内容。

恢复版工作台的候选清单使用带稳定编号的条目。资料仍保存在候选事项的同一数组，`checklistItemId` 为空时归属事项，有值时指向一条清单。引用用途由 `role` 区分。旧文字清单及无归属资料在读取时补齐编号并默认归属事项，旧链接或路径默认是来源引用。本机服务模式的附件记录新增 `attachmentId`，文件内容保存在 `data/attachments/`，不再共用文件大小额度。

导入备份时暂停当前页面的工作台保存，刷新后从数据库读回已导入数据。导入失败时恢复当前页面的保存流程。

独立回收站页面沿用工作台回收快照和恢复规则。载入旧版导航配置时补入回收站入口，保留已配置的其他入口。

目标、任务、习惯和日历事件复用候选事项的标签及清单资料处理。旧记录缺少标签或清单时按空列表读取，既有资料记录沿用兼容机制。目标编辑保留目标标识与原阶段信息，删除阶段后其任务仍关联原目标。

恢复版工作台在核心记录中保存 `tagCatalog`，包括标签稳定编号、名称和可选配色。记录仍存名称数组 `tags` 以兼容旧版备份。读取旧数据时按标准化名称收集标签，合并内容等价的名称。管理页改名与合并时同步更新活跃记录和回收站中的名称数组，合并时移除重复关联，并与标签库一起写入同一份工作台数据。

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

## 工作台清单兼容

图片预览复用附件读取接口或旧记录内嵌的图片内容。缩略图由浏览器临时生成，大图关闭后释放临时地址。文件副本、归属与备份结构沿用原记录。

清单继续使用稳定的 `id`，资料继续通过 `checklistItemId` 归属。复用 `title` 保存多行说明，`autoTitle` 表示该值由资料生成。旧文字条目读取为带编号的说明，旧的无归属资料读取到标记为 `legacyMaterials` 的「原有资料」。保存记录时写入这些归属，旧备份照常解析。来源引用与整理目标继续用 `role` 区分，附件继续由本机附件服务读写。移除资料先更新表单草稿，以便取消时仍可读取原附件。

## 规划优先级与手动位置

目标和阶段使用可选的 `priority`（`high`、`medium`、`low`）。缺少或无法识别优先级的历史记录按中优先级显示。手动位置沿用工作台中目标数组和目标的阶段数组顺序。筛选重排时，只将可见记录写回它们原占用的位置。优先级及其他自动排序仅用于显示，沿用现有备份格式。由阶段创建的任务使用已有的 `goalId` 与 `stageId` 记录归属。

## 目标类型与进度

目标记录以 `goalType` 存储 `outcome`（成果目标）或 `ongoing`（持续目标），缺少类型的旧目标按成果目标读取。成果目标的完成条件沿用 `ganttContext.criteria`。持续目标的目标日期可留空，时间轴拖入时可只写入开始日期。持续目标无总体百分比，复盘的进度值为 `null`，列表和甘特图使用阶段数量。按完成进度排序时有百分比的目标优先，持续目标继续按手动顺序排列。

## 规划列表与时间轴共用状态

方向沿用工作台 `directions`，目标的方向与开始日期复用 `ganttContext`，按字段覆盖以保留历史指标。计划、任务和阶段继续使用原有标识、顺序和备份结构。历史目标内的方向字段可作为读取回退。通过方向栏关联已有目标时只更新该目标的方向标识，保留开始日期、历史指标、阶段和任务关联。甘特图从主工作台获取只读投影，写入按目标或阶段日期、任务截止日期、计划新建或调整分别更新。已有计划保留时刻、时长及未涉及的字段。直接打开独立甘特图文件仍能查看原型演示。任务实际开始从最早一条有效执行片段的开始时间按本地时区计算，并保留估算标记。未记录时间的片段不参与计算，投影字段无需写入备份或迁移数据。

## 快速执行片段

快速开始复用任务的执行片段，使用 `source: quick_dispatch` 区分与专注页不同的恢复行为。开始和结束均存时间戳；刷新时恢复未结束的快速执行，耗时在暂停或完成时计算。实际显示按当地日期切分片段，复盘实际占用取有效区间并集。同一任务的实际时长仍由其各执行片段单独计算。

## 子任务兼容与归属

子任务仍嵌在父任务的 `subtasks` 数组中。旧文字按顺序补充稳定标识，首次保存后沿用。子任务独立保存状态和执行片段，计划以子任务标识关联。排期读入时同时接受父任务和子任务标识。删除父任务时子任务及其排期随父任务进入回收站。父任务编辑移除子任务时，有计划或执行历史的条目保留，并提示用户。

## 工作台执行管理

工作台快照内的 `workspaceOrder` 保存目标、阶段、任务的排序模式和手动顺序。父任务按目标及阶段归属划分排序范围，子任务按父任务划分。旧快照默认使用优先级及开始时间。任务开始时间优先读取最早有效排期，其次读取有效执行片段。阶段与目标读取规划开始日期。

子任务回收项使用 `subtask` 类型，包含 `parentTaskId`、原列表位置和关联排期。恢复前验证原父任务和记录标识。任务的有效标签按当前目标、阶段及任务自有标签实时合并，统计按任务标识去重。SQLite 表及接口继续使用原有工作台快照格式。
