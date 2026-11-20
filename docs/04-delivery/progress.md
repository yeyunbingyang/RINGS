# RINGS 开发进度

> 最后更新：2026-11-20

## v1.0.1 双端运行验收阶段

当前目标：验证正式工程在 Web 和 Windows Desktop 的运行与数据持久化，不扩展新业务页面。

| 工作项 | 状态 | 说明 |
|---|---|---|
| 技术架构冻结 | 已完成 | Desktop + Web 同时开发 |
| 正式项目骨架 | 已提交 | 共用 React SPA、Domain、Application、双端 Adapter |
| Web 类型检查 / 构建 | 已通过 | GitHub Actions |
| Windows Tauri 编译 | 已通过 | --no-bundle 编译 |
| Desktop workspace package | 本次补齐 | 增加 @rings/desktop 与本地 Tauri CLI |
| Web IndexedDB 集成测试 | 本次新增 | 覆盖 Task / Plan / WorkSession 与重新打开数据库 |
| Web / Desktop 运行时验证 | 待执行 | 需要真实浏览器和 Windows 桌面运行 |
| SQLite Migration 运行时验证 | 待执行 | 需首次启动创建数据库并重启验证 |
| pnpm lockfile | 待生成 | 在本地或可信 CI 环境生成后提交 |
| 安装包生成 | 未开始 | 运行时验收后进行 |

## 本次新增的自动化测试范围

1. Task 标题规范化与空标题拒绝。
2. Plan 重叠检查、显式取消后释放冲突。
3. 同一 Task 并发启动 WorkSession 时只允许一个成功。
4. WorkSession 未结束时不能完成 Task；结束后可以完成。
5. Task 软删除和恢复不会删除关联 Plan / WorkSession。
6. 新 Repository 实例可以读取已保存记录。

测试使用 fake-indexeddb 验证 IndexedDB Adapter 的数据访问行为。它不替代真实浏览器 IndexedDB 的跨刷新 / 浏览器关闭验收。

## 下一步验收门槛

- CI 中 typecheck、测试、Web production build 全部通过。
- Windows Tauri 构建确实执行本地 CLI，而不是空跑 workspace filter。
- Web 浏览器刷新后 Task / Plan / WorkSession 仍存在。
- Desktop 退出并重新启动后 SQLite 数据仍存在。
- 迁移错误有明确错误提示，不覆盖已有数据。
