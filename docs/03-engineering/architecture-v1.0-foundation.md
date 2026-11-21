# RINGS v1.0 技术架构

> 状态：已冻结（2026-11-20，适用于 v1.0 foundation / MVP 范围）。后续重大变更通过 ADR 记录。

## 1. 产品平台决策

用户确认首发平台为 **B：Desktop + Web 同时开发**。

- 两端共用同一套 React SPA、Domain、Application 和 Repository 契约。
- Web 通过浏览器运行，共用 `apps/client`。
- Desktop 使用 Tauri 2 容器加载同一套前端构建产物。
- 两端分别使用平台持久化适配器，不复制两套业务逻辑。
- 本版本不提供云同步；Web 与 Desktop 数据分别保存在各自本地环境。跨端交换能力后续通过显式导入 / 导出实现。

## 2. 技术栈冻结

| 层次 | 冻结方案 | 版本基线 |
|---|---|---|
| UI | React | 19.3.1 |
| 语言 | TypeScript | 5.9.3 |
| 构建工具 | Vite | 8.3.x |
| 包管理 | pnpm Workspace | pnpm 10.x |
| Desktop 容器 | Tauri | 2.12.x |
| Desktop 运行时 | Rust | 1.90+ |
| Desktop 数据库 | SQLite | 通过 Tauri SQL Plugin |
| SQL 插件 | tauri-plugin-sql | 2.6.x |
| Web 本地存储 | IndexedDB | 浏览器原生 API |
| 业务层 | Domain + Application | 纯 TypeScript |
| 数据访问 | Repository Port / Adapter | 平台隔离 |

Node.js 最低版本为 22.12。版本基线用于项目初始化；依赖补丁升级通过 lockfile 固定，升级主版本需要评估和记录。

## 3. 仓库目录

```text
apps/
  client/                         # Web 与 Desktop 共用 React SPA
  desktop/
    src-tauri/                    # Tauri Rust 容器、权限、配置和 SQL migrations
packages/
  domain/                         # Task / Plan / WorkSession 实体与规则
  application/                    # 用例、业务编排、Repository 接口
  infrastructure-web/             # IndexedDB Repository
  infrastructure-desktop/        # Tauri SQLite Repository
docs/
prototypes/
```

不建立第二套 Web 前端。Web 与 Desktop 都运行 `apps/client`；平台差异只在 Repository Adapter 和受控平台能力中体现。

## 4. 分层和依赖方向

```text
apps/client (React UI)
       |
       v
Application (RingsService / Use Cases)
       |
       v
Domain (Task / Plan / WorkSession)
       |
       v
RingsRepository interface
       |
       +---------------------------+
       |                           |
       v                           v
IndexedDB Adapter             Tauri SQLite Adapter
(Web browser)                 (Desktop WebView)
```

依赖规则：
- UI 只调用 Application Service，不拼接 SQL。
- Application 只依赖 Domain 和 Repository 接口。
- Domain 不依赖 React、Vite、Tauri、IndexedDB 或 SQLite。
- 平台 Adapter 实现相同 Repository 接口。
- Desktop SQL Plugin 只允许在 `infrastructure-desktop` 内调用。
- 文件访问、系统通知、全局快捷键等未来能力也必须通过 Platform Adapter 暴露。

## 5. 数据存储和同步边界

### Web
- 使用 IndexedDB，数据库名 `rings-v1`。
- 由 IndexedDB 版本号管理对象存储结构升级。
- 数据按浏览器 Origin 隔离；清除站点数据会影响本地数据。
- 不承诺任意读取用户本地路径。

### Desktop
- 使用 SQLite，数据库连接名 `sqlite:rings.db`。
- 数据库存放在 Tauri AppConfig 目录。
- SQL Plugin 通过 Rust 注册、版本化 Migration 和 Capability 权限启用。
- 前端只通过 Desktop Repository Adapter 调用 SQL Plugin。

### 双端关系
- 两端数据当前独立，不会自动合并或同步。
- 云同步不属于 v1.0 foundation。
- 后续跨端迁移需提供 JSON 导入 / 导出、冲突预览、用户确认和导入前备份。

## 6. 核心领域语义

- Task 是正式执行事项；Candidate 不在本轮核心数据库范围内。
- Task 生命周期与 Plan 调度状态分离。
- 一个 Task 可以关联多个 Plan。
- Plan 是预定安排；WorkSession 是实际执行事实。
- Deadline 是 Task 的期限，不从 Plan 推导。
- 取消 Plan 不删除 Task 或 WorkSession。
- Task 软删除设置 `deletedAt`，关联 Plan / WorkSession 保留；允许恢复。
- 永久删除暂不开放，避免误删历史和破坏外键关系。
- WorkSession 以开始、结束时间戳记录实际投入；每个 Task 同时最多一条未结束 Session。
- 修改 Goal / Stage 日期不得自动级联修改 Task Plan。

## 7. 时间规则

- 时间点以 ISO 8601 UTC 字符串持久化。
- Plan 额外保存用户本地日历日期 `planDate` 和 IANA 时区 `timezone`。
- 全天 / 日期型数据应使用日期语义，不转换成 UTC 午夜时间点。
- 显示时根据记录时区和用户当前时区规则转换。
- WorkSession 的实际时长来自 startedAt / endedAt，不使用 Plan 时长代替。

## 8. 冲突和一致性

- 新建 Plan 前检查与现有 planned Plan 的时间重叠。
- 冲突默认提示；用户明确确认后可以保留重叠，不自动挪动其他计划。
- 取消 Plan 仅修改该 Plan 的 status。
- WorkSession 开始操作在 Repository 层再次检查同一 Task 是否已有活动 Session；SQLite 通过部分唯一索引兜底。
- 写入失败必须向 UI 返回错误；UI 不得在持久化确认前显示成功。
- 关键业务的事务边界在后续 Task / Plan 完整实现阶段补齐并进行并发测试。

## 9. v1.0 foundation 当前实现范围

已建立代码骨架和首个可运行 UI 切片：
- Task 创建、完成、软删除、恢复。
- Plan 创建、取消、重叠检查和用户确认。
- WorkSession 开始、结束和实际时长记录。
- Web IndexedDB 与 Desktop SQLite 双适配器。
- SQLite v1 migration。
- 共用 React 前端和 Tauri 桌面入口。

尚未完成：Task 编辑 / 子任务、完整首页时间线、甘特图接入正式数据、Goal / Stage、Candidate、Habit、Review、附件管理、备份导入导出、跨端同步、发布安装包。

## 10. 架构验收

- `pnpm dev:web` 可以启动 Web 开发环境。
- `pnpm dev:desktop` 可以启动 Tauri 桌面开发环境（需安装 Rust 和目标平台依赖）。
- `pnpm build:web` 可以构建 Web 前端。
- Desktop 和 Web 通过同一 Application Service 执行核心用例。
- Repository Adapter 替换不需要修改 Domain / Application。
- 重启后 Task / Plan / WorkSession 数据可恢复。
- 迁移失败不应静默覆盖已有数据库。
- 双端数据独立和无云同步限制在产品界面与文档中明确说明。
