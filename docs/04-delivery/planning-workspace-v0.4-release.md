# RINGS v0.4 规划工作区原型交付记录

- 日期：2026-11-18
- 版本：v0.4
- 范围：Direction / Goal / Stage / Task 关联规划工作区
- 状态：原型首轮完成（prototype_only）

## 交付内容

- Direction 新建、编辑、暂停和归档。
- Goal 新建、编辑、状态筛选、搜索、指标更新、归档和软删除。
- Goal 创建时可选建立多个 Stage。
- Stage 新建、编辑、排序、状态更新和删除。
- Task 可直接关联 Goal 或归属 Stage。
- 从 Goal 创建 Task 默认未安排，不自动创建 Plan。
- 可关联现有 Task、解除关系。
- Candidate 转 Goal 保留来源标识。
- Goal 回收站支持恢复和永久删除确认。

## 静态检查

- 内嵌 JavaScript 通过 node --check。
- HTML 结构解析通过。
- 浏览器端交互与窄屏布局尚待目标浏览器复测。

## 非交付范围

正式数据库、API、账号、同步、真实 Candidate / Execution 数据连接、生产构建和自动化 E2E。
