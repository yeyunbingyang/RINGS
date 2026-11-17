# RINGS 测试计划（Test Plan）

## 1. 测试目标

验证业务规则、数据一致性、首页调度交互、文件引用和跨平台边界。测试状态必须有可复现证据。

## 2. 测试层级

- Unit：领域规则和服务逻辑。
- Integration：Repository、Plan、WorkSession、Material 关联。
- UI：页面状态、表单、拖放和时间切换。
- E2E：从创建到执行的端到端闭环。
- Platform：Desktop / Web 文件访问、通知和时间行为。
- Data：备份、恢复、迁移和历史完整性。

## 3. 核心测试范围

| 测试域 | 重点 |
|---|---|
| Candidate | 十种分类、备注、标签、时间语义、转换、归档 |
| Planning | Direction / Goal / Stage 关系和进度口径 |
| Execution | Task / Subtask / Habit / WorkSession 状态 |
| Scheduling | 未安排池、Plan、拖放、改期、冲突、撤销 |
| Material | 附件副本、URL、文件、文件夹引用、失效处理 |
| Management | Collection、Relation、Review、Statistics、Backup |
| Platform | Desktop / Web 权限和路径差异 |

## 4. 关键边界测试

- Candidate 有 Deadline Hint，但没有行动责任，不自动变 Task。
- Candidate Event 不等于 CalendarEvent。
- Waiting Candidate 与 waiting Task 状态不混淆。
- Task 无 Plan 时仍显示在未安排池。
- 拖放 Task 只创建 Plan，不创建重复 Task。
- 取消 Plan 不删除 Task。
- 改期不修改历史 WorkSession。
- CalendarEvent 不进入未安排任务池。
- 文件夹引用默认不复制、不递归扫描。
- Web 不访问未经授权的本地绝对路径。
- 归档可恢复，删除与归档不同。

## 5. 发布门槛

- P0 验收用例通过。
- 严重缺陷清零。
- 数据备份和恢复至少完成一次验证。
- 时间与计时在应用挂起 / 恢复后正确。
- Desktop / Web 的已支持能力和限制明确。
- 版本说明与已知问题齐全。
