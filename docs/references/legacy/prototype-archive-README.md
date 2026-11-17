# TDO HTML 高保真原型

本目录保存 TDO 的 **产品设计原型归档**。正式 React / Tauri 源码位于 `../src/`，两者职责分离。

## 当前正式设计基线

- `index.html` — 默认打开最新正式原型；
- `V2.0-全量高保真交互原型.html` — **当前 V2.0 全量高保真交互基线**；
- `V2.0-assets/` — V2.0 原型压缩归档资源，恢复出的原始 HTML SHA256：`59c21db9cd8fa8d8486096306ce01c9888bb5e56c594232d74592a15bc5e4942`；
- `V1.3-灵感面板.html` — 历史 V1.3 语义实验；
- `V1.1-统计与复盘中心.html` — 历史 V1.1 归档。

## V2.0 核心业务

```text
Capture → Clarify → Think → Commit → Plan → Execute → Review
```

核心对象强制分离：

```text
Record ≠ Idea ≠ Task ≠ Plan
```

贯穿层：

```text
Work Context
Thought Stream
```

V2.0 原型完整覆盖：

- Today；
- Task Library；
- Planning；
- Timeline；
- Statistics；
- Review；
- Focus / WorkSession；
- Record Inbox；
- Ideas / Maturity；
- Quick Capture；
- Resume；
- Work Context；
- Thought Stream；
- End Session；
- Commit → Task。

## 原型与正式源码

```text
需求 / PRD
   ↓
高保真 HTML 原型
   ↓
业务与交互评审
   ↓
React / Tauri 正式实现
   ↓
Desktop / Web 共用正式 UI
```

V2.0 已进入正式源码实施阶段。实现状态见 `../docs/IMPLEMENTATION_V2.0.md`。

## 打开方式

直接打开：

```text
prototype/index.html
```

或：

```text
prototype/V2.0-全量高保真交互原型.html
```

V2.0 归档使用浏览器原生 `DecompressionStream` 恢复原始高保真 HTML，请使用最新版 Edge / Chrome。
