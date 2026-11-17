# 跨层支撑能力

> 本文定义不属于单一业务层、但被多个能力复用的服务。

## XCAP-01 补充资料（Material）

适用对象：Candidate、Direction、Goal、Stage、Task、Habit、CalendarEvent、Review。

包括 Managed Attachment（RINGS 管理的文件副本）与 External Reference（URL、URI、本地路径、网络路径或文件夹路径），以及预览元数据、来源说明、可用性状态、解除关联、重新定位和打开操作。

## XCAP-02 工作上下文（WorkContext）

用于记录执行时需要恢复或打开的外部工作现场：AI 会话、GitHub Repo、文件和文件夹、网页、终端、自定义链接。

WorkContext 不等于 Material：前者偏执行现场，后者偏参考资料。两者可以引用同一位置。

## XCAP-03 思考流（Thought Stream）

记录思考、问题、决策、结论和 Next Action。可关联 Candidate、Task、WorkSession 和 Review。

待确认：Thought 是否独立实体；是否支持无 Task 的全局 Thought；AI 会话自动捕获是否纳入范围；隐私和来源权限。

## XCAP-04 时间与提醒服务

统一处理 Deadline、Plan 时间、Calendar Event 时间、Reminder、Follow-up、Review 时间、用户时区与夏令时。提醒不得把不同时间语义混为一谈。

## XCAP-05 搜索、关联和来源追溯

跨对象搜索标题、备注、标签和允许索引的元数据。外部文件夹默认不扫描内容。转换 Candidate 时保留来源追溯。
## XCAP-06 平台文件访问与权限

Desktop 可以在用户授权范围内选择和打开本地文件 / 文件夹；Web 只在浏览器授权能力范围内工作。不得默认读取或上传外部文件。
