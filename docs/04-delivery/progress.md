# RINGS 开发进度

> 最后更新：2026-11-20

## v1.0.1 双端运行验收阶段

当前目标：验证正式工程在 Web 和 Windows Desktop 的运行与数据持久化，不扩展新业务页面。

| 工作项 | 状态 | 说明 |
|---|---|---|
| 技术架构冻结 | 已完成 | Desktop + Web 同时开发 |
| 正式项目骨架 | 已提交 | 共用 React SPA、Domain、Application、双端 Adapter |
| Desktop workspace package | 已完成 | @rings/desktop 与本地 Tauri CLI |
| Web 类型检查 | 已通过 | CI run 44755239755 |
| Web 单元 / IndexedDB 集成测试 | 已通过 | 5 / 5 测试通过 |
| Web production build | 已通过 | CI run 44755239755 |
| Windows Tauri CLI 检查 | 已通过 | 本地 CLI 实际执行 |
| Windows Tauri 应用编译 | 已通过 | build --no-bundle；CI run 44755239755 |
| pnpm / Cargo lockfiles | 已生成 | CI artifact 已上传；尚未提交到仓库 |
| Web 浏览器真实运行 | 待执行 | 刷新页面后验证 IndexedDB 数据 |
| Desktop 真实运行 | 待执行 | Windows 启动、关闭、重新打开 |
| SQLite Migration 运行时验证 | 待执行 | 首次建库和重启恢复 |
| 安装包生成 | 未开始 | 运行时验收后进行 |

## 本阶段自动化测试

1. Task 标题规范化与空标题拒绝。
2. Plan 重叠检查、显式取消后释放冲突。
3. 同一 Task 并发启动 WorkSession 时只允许一个成功。
4. WorkSession 未结束时不能完成 Task；结束后可以完成。
5. Task 软删除和恢复不会删除关联 Plan / WorkSession。
6. 新 Repository 实例可以读取已保存记录。

当前 Vitest 执行 5 项测试，全部通过。fake-indexeddb 用于验证 IndexedDB Adapter 行为，不替代真实浏览器的刷新 / 关闭验收。

## 依赖锁文件

CI 已生成 pnpm-lock.yaml 和 apps/desktop/src-tauri/Cargo.lock，并上传为 workflow artifact：

https://github.com/yeyunbingyang/RINGS/actions/runs/44755239755

仓库当前尚未提交这两个锁文件。需要从该次运行下载 rings-dependency-lockfiles artifact，解压到仓库根目录后提交；或在本地运行安装 / 构建命令生成，再提交。

## 下一步验收门槛

- Web 浏览器刷新后 Task / Plan / WorkSession 仍存在。
- Desktop 退出并重新启动后 SQLite 数据仍存在。
- SQLite migration 失败时有明确错误提示，不覆盖已有数据。
- Web 与 Desktop 本地数据隔离符合预期。
- 完成手动验收后，再进入 Task 编辑 / 子任务 / 完整调度时间线开发。
