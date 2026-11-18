# RINGS 项目路线图（Roadmap）

> 路线图是建议实施顺序，不代表已经排定日历日期。

## 阶段 0：文档和产品基线

交付：文档体系、产品总览、领域模型、能力地图、业务规则、历史原型映射和待决策清单。

退出条件：核心领域概念评审通过；P0 / P1 范围没有关键冲突；CAP 编号稳定。

## 阶段 1：UI / UX 设计

交付：信息架构、首页线框图、首页 HTML 原型、Candidate Pool / Detail 原型、统一执行库（Task + Habit）原型、Planning Workspace 原型、UI 组件和交互规范。

退出条件：用户验证首页拖放调度闭环；核心页面流程可演示；主要空状态、错误状态和冲突状态已覆盖。

## 阶段 2：技术方案冻结

交付：技术架构、数据模型、Desktop / Web 平台适配、本地文件与附件方案、数据备份和迁移方案、ADR 决策。

退出条件：核心实体和关系冻结；数据迁移和备份策略明确；关键平台风险有处理方案。

## 阶段 3：核心纵向闭环 MVP

建议优先实现：
1. 应用 Shell 和本地数据存储。
2. Task 创建 / 编辑。
3. 未安排任务池。
4. Plan 创建和时间线显示。
5. Task 拖放到时间线。
6. WorkSession 开始 / 结束。
7. 完成任务和基础历史记录。

退出条件：从创建 Task 到安排时间、执行、完成的流程真实可运行；数据重启后仍可恢复；有可重复验收测试。

## 阶段 4：产品核心能力扩展

Candidate 统一捕捉和十种分类、CandidateNote、Material、External Reference、Direction / Goal / Stage、Subtask、CalendarEvent、Habit / HabitOccurrence、WorkContext / Thought。

## 阶段 5：管理和增强能力

Review / Statistics、Collection / Relation、备份导出增强、批量调度、年度路线图增强、智能建议（必须用户确认）。

## 阶段 6：质量、发布和迭代

完整测试、性能和稳定性、数据恢复演练、打包和发布、发布说明、用户反馈闭环。


## 页面架构补充（2026-11-18）

执行层的页面入口调整为统一“执行库”，不再分别建设 Task Library 和 Habit 两个一级页面。Task、Habit、HabitOccurrence 的领域模型与业务规则保持独立。Candidate Pool 继续作为捕捉层独立页面。


## 阶段 1 页面设计增量（2026-11-18）

规划工作区 v0.4 已完成首轮 HTML 原型和页面规格（prototype_only），覆盖 Direction / Goal / Stage / Task 关联。用户评审通过后，进入阶段 2 技术方案冻结；当前不把原型交互标记为正式代码完成。
