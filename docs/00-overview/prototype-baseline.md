# 原型基线与历史模型映射

> 基线来源：用户明确指定的 `prototype.zip`。本文只记录归档中实际存在的内容，不把原型等同于正式产品实现。

## 1. 原型压缩包内容

检查 `prototype.zip` 后，确认包含：
- 原始番茄 Todo 需求文档（PRD v1.0）。
- V1.1 统计与复盘中心 HTML。
- V1.3 灵感面板 HTML。
- V2.0 全量高保真交互原型恢复入口。
- V2.0 原型压缩资源 `V2.0-assets/prototype.part01.js` 至 `part08.js`。
- README 和默认入口 `index.html`。

V2.0 压缩 HTML 已恢复。恢复后 SHA-256：

`59c21db9cd8fa8d8486096306ce01c9888bb5e56c594232d74592a15bc5e4942`

与压缩包 README 中记录的哈希一致。

## 2. 原始 PRD v1.0 的产品方向

原始 PRD 定义为桌面番茄 Todo 应用，重点包括：
- 目标任务管理和待办集。
- 四种任务完成模式：倒计时、正计时、量词目标、纯打卡。
- 每日任务与番茄钟专注。
- 统计数据与成就。
- 时间轴。
- 记忆复习模式与间隔算法。
- 意外情况处理、延期规划和智能重排。
- 数据模型、桌面端界面和提醒机制。

这些内容属于历史需求。当前 RINGS v2.2.2 没有全部重新确认，因此不得默认全部纳入当前首版。

## 3. V2.0 原型实际呈现的功能

V2.0 可见导航和交互内容包括：
- 今日（Today）
- 任务库（Task Library）
- 规划（Planning）
- 时间轴（Timeline）
- 统计（Statistics）
- 复盘（Review）
- 专注（Focus）
- 记录 Inbox
- 灵感（Ideas）
- Quick Capture
- Work Context
- Thought Stream
- Resume / 继续工作
- Next Action
- Decision / Question
- Commit → Task

V2.0 README 定义的核心业务流程：

`Capture → Clarify → Think → Commit → Plan → Execute → Review`

V2.0 强调：

`Record ≠ Idea ≠ Task ≠ Plan`

并把 Work Context、Thought Stream 作为贯穿层。

## 4. V2.0 到当前 RINGS 的概念映射

| 历史 V2.0 概念 / 页面 | 当前 RINGS 对应 | 处理原则 |
|---|---|---|
| Record | Candidate（候选事项） | 统一为 Candidate；保留来源和原始内容 |
| Idea | Candidate，分类为想法（Idea） | 不再作为独立顶层收集实体 |
| Task | Task（任务） | 保留“已确认行动”的语义 |
| Plan | Plan（计划） | 保留为时间安排，不等于 Task |
| Today | 可视化调度首页 | 升级为默认首页 |
| Task Library | 执行层任务库 | 只管理正式 Task |
| Planning | 规划层 | Direction / Goal / Stage |
| Timeline | 可视化调度 / 历史时间轴 | 需明确计划与实际的展示边界 |
| Statistics | 管理层统计 | 不改变业务状态 |
| Review | 管理层回顾 | 可生成 Candidate、Task 或 Decision |
| Focus / WorkSession | 执行层 | 记录实际执行 |
| Work Context | 跨层工作上下文能力 | 保留为可关联资源 |
| Thought Stream | 跨层思考记录能力 | 保留，但数据归属和独立入口待设计 |
| Commit → Task | Candidate → Task 转换 | 保留来源追溯，不删除 Candidate |

## 5. V2.0 相对当前 RINGS 的关键变化

1. Candidate 统一管理十种候选事项分类，不再把 Record、Idea 当作平行的独立收集体系。
2. 新增明确的 Direction / Goal / Stage 规划模型。
3. Task 与 Goal、Stage 分离。
4. Habit 是独立重复规则，不是 Task Kind。
5. 可视化调度层成为默认首页。
6. 未安排任务池与时间线形成拖放调度闭环。
7. 补充资料、文件附件、外部引用成为通用关联能力。
8. 计划、截止时间、事件时间和实际执行记录严格分离。

## 6. 原型和正式源码的边界

`prototype.zip` 内是需求文档、HTML 原型、压缩原型资源和 README。压缩包本身不包含正式 React / Tauri 源码。

原型 README 提到正式源码位于归档目录之外的 `../src/`，但该源码不在本次确认的压缩包内。因此：
- 可以确认 V2.0 原型文件存在。
- 可以确认原型呈现的页面与交互概念。
- 不能据此确认正式应用代码已经实现。
- 不能据此确认数据库、API、测试或打包已完成。

## 7. 本次文档整理的基线优先级

1. 当前用户确认的 RINGS 产品决策。
2. 当前 RINGS PRD v2.2.2。
3. `prototype.zip` 中的 V2.0 原型作为历史 UI / UX 参考。
4. 原始 PRD v1.0 作为历史需求参考。

历史原型中的记忆复习、自动延期重排、白噪音、成就系统等，若当前 PRD 未重新确认，应标记为历史参考或待决策。
