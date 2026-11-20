# RINGS v0.9 规划工作区交付记录

- 日期：2026-11-20
- 版本：v0.9
- 基线：规划工作区 v0.8
- 状态：交互原型完成（prototype_only）

## 交付范围

1. 保留 v0.8 原有 Direction / Goal / Stage / Task 关联列表工作区。
2. 增加列表视图 / 甘特图视图切换，列表视图仍为默认入口。
3. 甘特图展示 Direction 分组、Goal 周期、Stage 周期和 Task Plan。
4. 支持周 / 月 / 季 / 年时间尺度、前后导航、回到今天。
5. 支持方向、目标状态、关键词筛选，以及层级显示密度控制。
6. 支持 Goal / Stage / Plan 时间条拖动和边缘调整。
7. 支持 Task Deadline 独立标记与编辑。
8. 支持未排期 Goal / Stage 补充规划日期，以及未排期 Task 拖入时间轴创建 Plan。
9. 支持一个 Task 对应多个 Plan；取消 Plan 不删除 Task。
10. 沿用 v0.8 localStorage key，并对缺失的 `plans` 集合做非破坏性迁移。
11. 修正移动端页面横向溢出，保留甘特图内部横向滚动。

## 业务边界

- Goal / Stage 日期属于规划数据。
- Task Plan 属于调度数据。
- Deadline 是最晚完成期限，与 Plan 独立。
- WorkSession 实际投入不从甘特图或 Plan 推算。
- 修改父级日期不自动级联修改子级日期。

## 静态与浏览器检查

- HTML 结构解析通过。
- 内嵌 JavaScript `node --check` 通过。
- Chromium 冒烟检查通过：列表 / 甘特图切换、Goal 新建、时间尺度切换、层级模式、Plan 创建 / 拖动 / 调整 / 取消、Task 保留、Deadline 独立编辑。
- Task 从未排期池拖入时间轴创建 Plan 的 Drop 处理通过合成 DragEvent 检查；真实桌面浏览器拖放仍建议用户环境复测。
- 390px、768px、1440px 视口页面横向溢出检查通过。
- 浏览器脚本错误：0。

## 已知限制

- 当前仍是单文件 HTML 原型，数据使用浏览器 localStorage。
- 真实 Candidate、Execution、Plan 服务和数据库尚未连接。
- 未实现冲突检测、自动重排、撤销 / 重做、依赖关系和关键路径。
- 日期视图不提供小时级 Plan 编辑。
- 不能将本原型交互验收等同正式应用开发完成。
