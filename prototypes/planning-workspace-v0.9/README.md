# RINGS 规划工作区 v0.9

打开 `index.html` 即可运行，无需安装依赖或启动服务器。

## 页面

- 默认进入 v0.8 原有列表视图。
- 顶部切换“列表视图 / 甘特图”。
- 甘特图支持周 / 月 / 季 / 年时间尺度。

## 时间语义

- Goal / Stage 时间条使用规划开始日期和期限。
- Task 时间条使用 Plan 的 startAt / endAt。
- Deadline 独立显示，不等于 Plan。
- 一个 Task 可以拥有多个 Plan。
- 取消 Plan 不删除 Task。

## 数据与限制

沿用 v0.8 localStorage key `rings-planning-v08`，对缺失的 plans 集合做非破坏性迁移。当前为 prototype_only，不连接正式 API / 数据库 / 真实执行库。
