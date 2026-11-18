# RINGS v0.8｜规划工作区原型

## 打开方式

直接打开同目录的 `index.html`，推荐使用最新版 Chrome 或 Edge。页面为单文件 HTML，无需安装依赖、启动开发服务器或配置环境。

## 页面范围

- Direction：发展方向创建、编辑、暂停与归档。
- Goal：目标创建、编辑、筛选、指标维护和生命周期管理。
- Goal 指标：数值、里程碑、布尔结果、自定义进度。
- Stage：阶段创建、编辑、排序、状态更新与删除。
- Task 关联：直接关联 Goal 或指定 Stage；支持创建 Task、关联已有 Task 和解除关联。
- Candidate 来源：演示 Candidate 转 Goal 并保留来源标识。
- 回收站：Goal 软删除、恢复与永久删除确认。

## 原型数据与限制

- 使用浏览器 `localStorage` 保存演示数据。
- 不连接正式数据库、API、Candidate Pool 或执行库。
- 不会创建真实 Task / Plan，也不代表正式应用功能已实现。
- 不同浏览器或不同本地访问地址的演示数据彼此独立。
- 清理浏览器该页面的站点数据会重置本地演示数据。

## 对应文档

- 需求与交互规格：`docs/02-design/planning-workspace-v0.8-spec.md`
- 交付记录：`docs/04-delivery/planning-workspace-v0.8-release.md`
- 验收记录：`docs/05-quality/planning-workspace-v0.8-acceptance.md`

状态：`prototype_only`。
