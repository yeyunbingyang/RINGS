# RINGS v0.3 交付记录

- 日期：2026-11-18
- 交付：执行库、候选事项、回收站 HTML 原型
- 级别：prototype_only

## 交付范围

Task / Habit 统一管理入口但保持独立实体；Task 生命周期和调度状态分离；HabitOccurrence 按日期保存；Candidate 十种分类与生命周期分离；支持 Candidate 备注、批量操作和显式转换；统一回收站支持软删除、恢复和永久删除确认。

## 验收

- Node 内嵌 JavaScript 语法检查通过。
- Chromium 冒烟：Task 新建、Candidate 新建、Candidate 转 Task、Habit 指定日期记录、Candidate 备注、软删除与恢复均通过。
- 390px 窄屏无横向溢出。
- pageerror：0。
- 受限执行环境通过内存存储适配器验证逻辑；真实浏览器 localStorage 由用户打开本地 HTML 时使用。
- 未验证正式数据库/API、真实附件上传、跨浏览器、生产构建和生产 E2E。

## 会话附件

- RINGS-v0.3-execution-candidate.html
- RINGS-v0.3-validated-delivery.zip
- RINGS-v0.3-spec.md
- RINGS-v0.3-acceptance-report.md
