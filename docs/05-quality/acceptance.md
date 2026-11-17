# RINGS 验收清单

## 1. 产品基线

- [ ] RINGS 品牌和术语统一。
- [ ] 五层架构和对象边界明确。
- [ ] Candidate 十种分类使用中文名称（English）。
- [ ] Candidate / Task / Goal / Stage / Habit / Plan / CalendarEvent / WorkSession 定义一致。

## 2. 捕捉能力 CAP-01

- [ ] 快速捕捉 Candidate。
- [ ] 十种分类可筛选。
- [ ] 支持多条备注。
- [ ] 支持 Tag。
- [ ] 支持时间语义区分。
- [ ] 支持外部 URL、文件和文件夹引用。
- [ ] 附件副本与外部引用区分。
- [ ] Candidate 转换保留来源。

## 3. 规划能力 CAP-02

- [ ] Direction 可独立存在。
- [ ] Goal 可定义指标、期限和完成条件。
- [ ] Goal 可拆分 Stage。
- [ ] Stage 可关联 Task。
- [ ] Task 可不关联 Goal。
- [ ] Goal 进度口径清晰。

## 4. 执行能力 CAP-03

- [ ] Task 可独立创建。
- [ ] 支持 Subtask。
- [ ] 生命周期状态与调度状态分离。
- [ ] 支持临时 Task。
- [ ] Habit 与 Task 分离。
- [ ] WorkSession 记录实际投入。
- [ ] Thought / WorkContext 可按确认范围关联。

## 5. 调度能力 CAP-04

- [ ] 默认首页是可视化调度工作台。
- [ ] 首页包含时间视图、未安排任务池和快速创建。
- [ ] Task 可拖放到日期或时间块。
- [ ] 拖放不重复创建 Task。
- [ ] Plan 与 Deadline 分离。
- [ ] 支持日 / 周 / 月 / 年视图。
- [ ] 支持改期、冲突提示和撤销。
- [ ] CalendarEvent 显示但不进入未安排池。
- [ ] Plan 调整不覆盖 WorkSession。

## 6. 管理能力 CAP-05

- [ ] 支持归档和恢复。
- [ ] 支持 Collection / Tag / Relation。
- [ ] 支持 Review / Statistics（按发布范围）。
- [ ] 支持备份和导出。
- [ ] 统计不改变业务状态。

## 7. 非功能验收

- [ ] 关键操作有明确反馈。
- [ ] 数据可备份和恢复。
- [ ] 本地文件访问遵循授权。
- [ ] 外部引用失效时不自动删除。
- [ ] 计时在挂起和恢复后正确。
- [ ] 键盘操作有替代拖放的方式。
