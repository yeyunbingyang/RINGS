# RINGS 技术架构（方案初稿）

> 状态：逻辑架构建议，技术栈尚未冻结。

## 1. 架构目标

- Desktop / Web 共用领域模型和核心业务规则。
- 平台能力通过 Adapter 适配。
- UI 不直接操作数据库或操作系统文件 API。
- 附件副本与外部引用分开管理。
- 计划时间与实际执行记录分开保存。
- 支持数据导出和备份。
- 未来可扩展同步，但当前不把云同步作为基线。

## 2. 逻辑分层

```text
Presentation Layer
  页面 / 组件 / 交互状态
        ↓
Application Layer
  用例 / 命令 / 查询 / 权限校验
        ↓
Domain Layer
  Candidate / Goal / Stage / Task / Habit / Plan
  业务规则 / 状态流转 / 领域服务
        ↓
Repository Interface
        ↓
Infrastructure
  Database / File Storage / Search / Notification
        ↓
Platform Adapter
  Desktop OS / Browser / File Picker / Open URL
```

## 3. 关键模块

- Candidate Service：捕捉、分类、备注、转换。
- Planning Service：Direction、Goal、Stage。
- Task Service：Task、Subtask、状态和依赖。
- Habit Service：Habit 和 HabitOccurrence。
- Scheduling Service：Plan、时间冲突、改期。
- WorkSession Service：实际执行记录。
- Material Service：附件和外部引用。
- Relation Service：跨对象关联。

恢复版工作台的新建任务目标选择器按目标数量渲染。直列和搜索结果共用同一个目标 ID 字段，保存沿用任务的 `goalId`，规划排序沿用现有列表排序逻辑。

目标详情优先按 `goalId` 查找关联任务，未记录目标 ID 的旧任务仍可按名称匹配。点击任务后按任务 ID 打开执行详情，并切到可显示该任务的筛选。
- Review / Statistics Service：回顾和统计。
- Backup / Export Service：备份和导出。

## 4. 平台结构

Desktop：提供本地文件 / 文件夹选择和打开能力、本地数据库访问；可选系统托盘、全局快捷键和通知。

Web：支持 URL 和用户主动上传；本地文件访问遵循浏览器授权能力；不承诺任意读取本地绝对路径。

## 5. 技术栈状态

当前 PRD 提到 Desktop / Web 共用核心业务模型，并建议 Desktop 优先评估 SQLite。原型 README 提到正式 React / Tauri 源码位于原型目录之外，但本次确认的压缩包不含该源码。

因此以下内容尚未冻结：前端框架、Desktop 容器、Web 部署方式、数据访问层、状态管理方案、本地数据库迁移框架、多端同步协议。

## 6. 核心实现原则

- UI 不直接写数据库。
- 所有状态变更通过应用用例执行。
- Plan 与 WorkSession 分开持久化。
- 计时以时间戳为准。
- 外部引用不自动上传。
- 文件夹引用默认不扫描。
- 破坏性操作有审计或恢复机制。
- 所有数据迁移有版本和备份策略。

工作台设置的角标选项使用原生单选组，继续通过现有设置保存流程读写布尔字段 `showNavCounts`。旧记录没有该字段时默认显示角标。

设置分组切换保留表单草稿，导航配置在保存时才提交到现有工作台记录。现有偏好字段直接用于周月视图星期顺序和任务创建默认时长。

候选事项页的两个分类捕捉入口向同一个创建弹窗传入分类键。弹窗用现有分类定义初始化并允许改选，保存仍使用现有 Candidate 分类字段。

顶部「收藏资料」使用同一个创建弹窗并锁定候选分类为 `resource`。附件读取和保存复用快速捕捉的资料处理；本机服务模式通过独立附件接口写入文件，现有候选事项和附件记录格式保持兼容。

## 7. 关键技术风险

- Desktop 与 Web 文件权限模型不同。
- 时区和夏令时可能影响计划显示。
- 拖放和时间冲突需要明确数据一致性策略。
- HabitOccurrence 的生成策略影响重复规则和补记。
- 计时器在休眠、刷新、崩溃后需要恢复。
- 大附件需要存储空间、备份和清理策略。

## 共享滚动样式

工作台与内嵌甘特图共用滚动样式和弹窗滑块组件。滑块只负责控制正文的滚动位置，内容变化后更新其大小与位置。高对比度模式使用系统提供的滚动条。
