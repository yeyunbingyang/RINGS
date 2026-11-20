# RINGS v0.9 规划工作区验收记录

> 证据级别：prototype_only。浏览器检查用于验证 HTML 原型，不代表正式应用自动化测试或生产验收。

| 检查项 | 结果 | 说明 |
|---|---|---|
| HTML 结构解析 | 通过 | HTMLParser 未发现未闭合标签 |
| JavaScript 语法 | 通过 | Node.js `node --check` |
| v0.8 列表视图保留 | 通过 | Direction / Goal / Stage / Task 关联布局仍可用 |
| 列表 / 甘特图切换 | 通过 | 列表默认；切换不删除原列表结构 |
| Goal / Stage 时间条 | 通过 | 读取原有开始日期与期限 |
| Task Plan 时间条 | 通过 | 使用独立 `plans` 集合，不把 Deadline 当 Plan |
| 一个 Task 多个 Plan | 已实现 | 每个有效 Plan 可独立显示与编辑 |
| 周 / 月 / 季 / 年 | 通过 | 时间尺度按钮和导航可切换 |
| 方向 / 状态 / 关键词筛选 | 通过 | 方向和目标状态筛选、事项搜索 |
| Goal 展开 / 收起 | 通过 | 可显示 Stage 与 Task 层级 |
| Goal 日期拖动 | 通过 | 父级日期变更不级联修改 Stage 日期 |
| Plan 整体移动 | 通过 | 只修改当前 Plan 的 startAt / endAt |
| Plan 边缘调整 | 通过 | 可独立调整计划开始或结束日期 |
| Task Deadline | 通过 | 菱形标记独立显示和编辑 |
| Task 从未排期池创建 Plan | 通过（事件检查） | 合成 DragEvent 触发 Drop 逻辑；建议真实浏览器再复测拖放手感 |
| 取消 Plan | 通过 | Task 保留；无其他有效 Plan 时回到未排期池 |
| localStorage 兼容 | 静态逻辑通过 | 缺少 plans 时补空数组，不覆盖已有数据 |
| 移动端横向溢出 | 通过 | 390px / 768px / 1440px 页面宽度检查 |
| JavaScript 运行错误 | 0 | Chromium 冒烟检查期间未发现 pageerror |
| 正式 API / 数据库 | 未实现 | 当前只使用 localStorage 原型数据 |

## 浏览器复测步骤

1. 打开 v0.9 HTML，确认默认进入列表视图，v0.8 原有三栏工作区仍存在。
2. 切换甘特图，确认 Direction / Goal / Stage / Task 层级显示。
3. 切换周、月、季度、年视图，并使用上一段、下一段和今天按钮。
4. 拖动 Goal 时间条，确认 Stage 日期不被级联修改。
5. 创建或拖动 Task Plan，确认 Task 不会重复创建。
6. 拖动 Plan 左右边缘，确认只改变 Plan 日期。
7. 编辑或拖动 Deadline，确认不修改 Plan。
8. 取消一个 Plan，确认 Task 仍存在且回到未排期事项池（如果没有其他有效 Plan）。
9. 在 390px 窄屏检查页面无横向溢出，甘特图本身可以在内部横向滚动。
