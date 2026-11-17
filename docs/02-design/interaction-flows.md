# RINGS 用户交互流程

## FLOW-01 快速捕捉候选事项

```text
用户触发全局快速捕捉
    ↓
输入标题 / 粘贴内容
    ↓
保存为 Candidate
    ↓
可选补充分类、备注、标签、资料和时间
    ↓
留在当前页面，不强制跳转
```

## FLOW-02 Candidate 回顾与转换

```text
打开候选事项池
    ↓
选择一条 Candidate
    ↓
判断后续去向
    ├── 保留 / 孵化
    ├── 归档 / 取消
    ├── 关联已有对象
    ├── 转为 Task
    ├── 转为 Direction / Goal
    └── 转为 CalendarEvent
```

转换必须保留来源 Candidate 和必要内容。

## FLOW-03 首页快速创建 Task

```text
首页点击“新建任务”
    ↓
输入标题
    ↓
选择仅创建或立即安排
    ├── 仅创建 → Task 进入未安排任务池
    └── 立即安排 → 选择日期 / 时间段 → 创建 Task + Plan
```

## FLOW-04 未安排 Task 拖放到时间线

```text
未安排任务池选择 Task
    ↓
拖到某日或某时间段
    ↓
创建 / 更新 Plan
    ↓
检查冲突
    ├── 无冲突 → 保存
    └── 有冲突 → 提示用户选择
    ↓
时间线更新
```

拖放不创建重复 Task，不自动改变 Deadline。

## FLOW-05 开始执行

```text
点击时间线中的 Task
    ↓
查看任务详情
    ↓
开始 WorkSession
    ↓
暂停 / 继续 / 结束
    ↓
记录实际投入和结果
    ↓
更新 Task 状态和统计
```

## FLOW-06 Goal / Stage 创建任务

```text
打开 Goal
    ↓
选择 Stage 或直接关联 Goal
    ↓
创建 Task
    ↓
Task 进入执行层
    ↓
Task 可在首页安排 Plan
```

## FLOW-07 文件夹引用

```text
在 Candidate / Task 详情中添加资料
    ↓
选择“引用文件夹”
    ↓
Desktop 文件夹选择器
    ↓
保存路径和显示名称
    ↓
展示引用状态
    ↓
点击打开 / 检查路径 / 重新定位
```

Web 不承诺直接访问本地任意路径。

## FLOW-08 等待事项跟进

```text
Candidate（等待）或 Task（waiting）
    ↓
设置 follow_up_at
    ↓
到期提醒
    ↓
记录回复或检查结果
    ├── 解除等待
    ├── 创建后续 Task
    └── 继续等待并更新跟进时间
```

## FLOW-09 周 / 月 / 年计划细化

```text
年度 Direction / Goal / Stage
    ↓
月度重点和阶段节点
    ↓
周计划分配日期
    ↓
日计划安排时间块
    ↓
实际执行与回顾
```

用户可以从任意时间尺度开始，不强制先有年度计划。
