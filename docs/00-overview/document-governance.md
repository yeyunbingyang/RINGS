# 文档维护规范

## 1. 单一职责与权威来源

| 内容 | 权威文档 |
|---|---|
| 产品定位、范围 | `product-overview.md`、`prd.md` |
| 领域实体和关系 | `domain-model.md` |
| 业务规则 | `business-rules.md` |
| 能力清单 | `capability-map.md`、各 CAP 文档 |
| 页面和导航 | `information-architecture.md` |
| UI 视觉与组件规范 | `ui-ux-spec.md` |
| 用户交互流程 | `interaction-flows.md` |
| 技术方案 | `03-engineering/` |
| 开发计划和进度 | `04-delivery/` |
| 验收与追踪 | `05-quality/` |
| 关键决策 | `decision-log.md` / `adr-log.md` |

## 2. 状态枚举

产品需求：`draft`、`review`、`confirmed`、`deprecated`、`deferred`。

设计：`not_started`、`in_progress`、`review`、`approved`、`superseded`。

开发：`not_started`、`in_progress`、`blocked`、`code_complete`、`verified`、`released`。

证据：
- `prototype_only`：仅有原型。
- `source_verified`：已检查正式源码。
- `test_verified`：已有测试证据。
- `production_verified`：已在实际运行版本验证。

不得用 `prototype_only` 标记为 `code_complete` 或 `released`。

## 3. 编号规范

| 对象 | 编号格式 | 示例 |
|---|---|---|
| 产品能力 | `CAP-层级-序号` | CAP-04-04 |
| UI 页面 / 设计 | `UI-层级-序号` | UI-04-01 |
| 交互流程 | `FLOW-序号` | FLOW-04 |
| 开发任务 | `DEV-层级-序号` | DEV-04-03 |
| 测试用例 | `TEST-层级-序号` | TEST-04-04 |
| 产品决策 | `DEC-序号` | DEC-008 |
| 技术决策 | `ADR-序号` | ADR-003 |
| 需求变更 | `CR-日期-序号` | CR-20261117-001 |
| 缺陷 | `BUG-序号` | BUG-012 |
| 软件发布 | `RINGS-x.y.z` | RINGS-0.1.0 |

编号分配后不因标题调整而复用。

## 4. 变更流程

```text
提出变更 → 登记 CR → 分析 CAP / Domain / UI / Tech / Test 影响
        → 记录 DEC / ADR → 更新权威文档
        → 更新原型、实施计划和追踪矩阵 → 评审并冻结版本
```

## 5. 版本规则

文档体系版本、产品 PRD 版本、原型版本和软件版本分别管理。重大领域模型变更需要提高 PRD 主版本或次版本；拼写、排版和补充解释提高文档修订号。

## 6. AI 协作规则

每次交给 AI 开发或修改时，提供目标 CAP、能力文档、UI / UX 文档、技术约束、验收用例和当前开发状态。AI 完成后应更新进度、日志、测试结果和追踪矩阵；不得仅凭生成代码声称功能已完成。
