# RINGS · 执行库与候选事项原型 v0.2

- 日期：2026-11-18
- 类型：静态 HTML 交互原型
- 状态：prototype_only
- 基线：v0.1

## 打开方式

直接在浏览器打开 index.html，无需安装依赖或启动服务。

## 本轮更新

- 普通任务详情中的“编辑”现在打开真实编辑表单，可修改标题、说明、优先级、预计时长、Deadline、Collection 和子任务。
- 习惯详情增加“编辑规则”，可修改名称、说明、重复规则与量词目标。
- 编辑保存后更新当前原型内存中的对象，不会重置任务状态或习惯执行状态。
- 量词数值与单位必须同时填写，或同时留空。
- 创建与编辑共用表单；编辑时锁定对象类型，避免 Task / Habit 互相变型。

## 已知限制

- 示例数据仍为浏览器内存数据，刷新后恢复初始数据。
- 不连接数据库、API、账号、提醒服务或真实文件系统。
- HabitOccurrence 仍是单一“今日状态”演示，不是按日期保存的实例历史。
- Candidate 编辑、批量操作、Candidate 转 Goal / Direction / CalendarEvent 完整转换表单仍待后续版本。
- 本版本已做 HTML 与 JavaScript 静态语法检查；浏览器布局、真实点击流程和可访问性验收仍待完成。

## 相关文档

- docs/02-design/execution-library-v0.1-spec.md
- docs/02-design/candidate-pool-v0.1-spec.md
- docs/04-delivery/progress.md
