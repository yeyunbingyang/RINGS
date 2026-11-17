# RINGS · 执行库与候选事项原型

- 原型版本：v0.1
- 日期：2026-11-18
- 类型：静态 HTML 交互原型
- 状态：prototype_only

## 打开方式

直接在浏览器中打开 index.html 即可，无需安装依赖、启动服务或配置数据库。

GitHub 文件地址：
https://github.com/yeyunbingyang/RINGS/blob/main/prototypes/execution-candidate-v0.1/index.html

## 页面范围

本原型包含两个工作区：

1. 执行库：统一普通任务与习惯的页面入口，页面内提供全部执行 / 普通任务 / 习惯视图。
2. 候选事项：统一 Candidate Pool，提供十种分类筛选、生命周期筛选、快速捕捉和详情面板。

## 可交互内容

### 执行库
- 切换全部执行、普通任务和习惯。
- 按任务状态、习惯状态和快捷条件筛选。
- 搜索任务和习惯。
- 查看任务详情、子任务、Deadline、Plan 摘要和上下文区域。
- 标记任务完成、重新打开和切换等待状态。
- 新建普通任务，支持子任务列表；新建后默认进入未安排状态。
- 新建习惯，设置重复规则与量词目标。
- 记录或撤销今日习惯执行；暂停或恢复习惯。

### 候选事项
- 按十种固定分类筛选。
- 按生命周期状态筛选。
- 搜索标题、内容、备注和标签。
- 新建候选事项，填写分类、标签、备注、外部引用和跟进时间。
- 查看详情、添加备注、保留、孵化、归档或取消。
- 演示 Candidate 转为 Task 并保留来源关系。

## 业务边界

- 页面入口合并不代表领域实体合并。Task、Habit、HabitOccurrence 保持独立。
- Habit 表示重复规则；HabitOccurrence 表示单次执行实例。
- 未安排任务池只接收正式 Task，不接收 Candidate 或 Habit 规则。
- Candidate 转换必须由用户确认；转换后保留原 Candidate 和来源关系。
- 外部 URL / 文件路径仅作为引用展示，不自动读取、复制或上传源文件。

## 已知限制

- 所有示例数据均为演示数据。
- 状态只保存在当前页面内存中；刷新页面会恢复初始示例数据。
- 不连接数据库、API、账号、提醒服务或真实文件系统。
- Candidate 转为 Task 有交互演示；转为 Goal / Direction / CalendarEvent 仅展示目标选择和状态反馈，完整转换表单待后续补齐。
- 当前不是正式应用，不代表已完成持久化、权限、同步、数据迁移或生产环境测试。
- 已完成静态检查：HTML 中 script 标签成对，内嵌 JavaScript 语法解析通过；该检查不覆盖真实浏览器布局与交互。
- 当前尚未提供本页面的浏览器自动化验收报告。

## 相关规格

- docs/02-design/execution-library-v0.1-spec.md
- docs/02-design/candidate-pool-v0.1-spec.md
- docs/02-design/information-architecture.md
- docs/02-design/interaction-flows.md
- docs/02-design/ui-ux-spec.md
- docs/04-delivery/progress.md
