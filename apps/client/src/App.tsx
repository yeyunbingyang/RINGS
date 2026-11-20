import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Plan, Task, WorkSession } from "@rings/domain";
import { PlanConflictError, RingsService } from "@rings/application";
import { createRuntimeRepository } from "./create-runtime-repository";

function toLocalInputValue(date: Date): string {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return adjusted.toISOString().slice(0, 16);
}

function formatDate(value: string | null): string {
  if (!value) return "未安排";
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
  });
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? hours + " 小时 " + minutes + " 分钟" : minutes + " 分钟";
}

function taskStatusLabel(task: Task): string {
  if (task.deletedAt) return "回收站";
  const labels: Record<Task["status"], string> = {
    open: "待执行",
    in_progress: "进行中",
    blocked: "受阻",
    completed: "已完成",
    cancelled: "已取消",
    archived: "已归档"
  };
  return labels[task.status];
}

export default function App() {
  const [service, setService] = useState<RingsService | null>(null);
  const [platform, setPlatform] = useState<"Web" | "Desktop">("Web");
  const [storage, setStorage] = useState<"IndexedDB" | "SQLite">("IndexedDB");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleTaskId, setScheduleTaskId] = useState("");
  const [planStart, setPlanStart] = useState(() => toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)));
  const [planEnd, setPlanEnd] = useState(() => toLocalInputValue(new Date(Date.now() + 90 * 60 * 1000)));
  const [showTrash, setShowTrash] = useState(false);

  async function refresh(target: RingsService): Promise<void> {
    const [nextTasks, nextPlans, nextSessions] = await Promise.all([
      target.listTasks(true), target.listPlans(), target.listWorkSessions()
    ]);
    setTasks(nextTasks);
    setPlans(nextPlans);
    setSessions(nextSessions);
    if (!scheduleTaskId) {
      const firstOpen = nextTasks.find((task) =>
        !task.deletedAt && !["completed", "cancelled", "archived"].includes(task.status)
      );
      if (firstOpen) setScheduleTaskId(firstOpen.id);
    }
  }

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const runtime = await createRuntimeRepository();
        await runtime.repository.initialize();
        const nextService = new RingsService(runtime.repository);
        if (!mounted) return;
        setPlatform(runtime.platform);
        setStorage(runtime.storage);
        setService(nextService);
        await refresh(nextService);
      } catch (cause) {
        if (mounted) setError(cause instanceof Error ? cause.message : "初始化失败。");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const activeTasks = useMemo(() => tasks.filter((task) => !task.deletedAt), [tasks]);
  const visibleTasks = useMemo(
    () => showTrash ? tasks.filter((task) => Boolean(task.deletedAt)) : activeTasks,
    [activeTasks, showTrash, tasks]
  );
  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const plannedPlans = useMemo(
    () => plans.filter((plan) => plan.status === "planned"),
    [plans]
  );
  const activeSeconds = sessions.reduce((total, session) => total + session.actualSeconds, 0);
  const runningSessions = sessions.filter((session) => !session.endedAt);

  async function runAction(action: (target: RingsService) => Promise<void>): Promise<void> {
    if (!service) return;
    setBusy(true);
    setError("");
    try {
      await action(service);
      await refresh(service);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "操作失败，请重试。");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await runAction(async (target) => {
      const created = await target.createTask(title, description);
      setTitle("");
      setDescription("");
      setScheduleTaskId(created.id);
    });
  }

  async function handleSchedule(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!planStart || !planEnd || new Date(planStart) >= new Date(planEnd)) {
      setError("请设置有效的开始和结束时间。");
      return;
    }

    await runAction(async (target) => {
      const input = {
        taskId: scheduleTaskId,
        planDate: planStart.slice(0, 10),
        startAt: new Date(planStart).toISOString(),
        endAt: new Date(planEnd).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
      };
      try {
        await target.scheduleTask(input);
      } catch (cause) {
        if (!(cause instanceof PlanConflictError)) throw cause;
        const accepted = window.confirm(
          "检测到 " + cause.conflicts.length + " 条时间重叠的计划。是否仍然保存这条计划？"
        );
        if (!accepted) return;
        await target.scheduleTask(input, true);
      }
    });
  }

  function taskSession(taskId: string): WorkSession | undefined {
    return runningSessions.find((session) => session.taskId === taskId);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">R</div>
          <div>
            <div className="brand-name">RINGS</div>
            <div className="brand-subtitle">年轮 · Personal OS</div>
          </div>
        </div>
        <div className="nav-caption">工作区</div>
        <button className="nav-item active"><span>◷</span> 执行与调度</button>
        <button className="nav-item" disabled><span>◎</span> 规划工作区 <small>后续接入</small></button>
        <button className="nav-item" disabled><span>⌑</span> 候选事项 <small>后续接入</small></button>
        <button className="nav-item" disabled><span>↗</span> 复盘中心 <small>后续接入</small></button>
        <div className="sidebar-bottom">
          <div className="storage-indicator"><span className="status-dot" /> 本地数据已启用</div>
          <div className="sidebar-version">RINGS v1.0 · Foundation</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">FOUNDATION BUILD</div>
            <h1>执行与调度</h1>
            <p>先打通任务、计划与实际执行记录，再逐步接入完整工作区。</p>
          </div>
          <div className="runtime-badges">
            <span className="runtime-badge">{platform}</span>
            <span className="runtime-badge muted">{storage}</span>
          </div>
        </header>

        {error && <div className="alert" role="alert">{error}</div>}

        {loading ? (
          <section className="panel loading-panel">正在初始化本地数据层…</section>
        ) : (
          <>
            <section className="stats-grid">
              <div className="stat-card"><span>有效任务</span><strong>{activeTasks.length}</strong></div>
              <div className="stat-card"><span>待执行计划</span><strong>{plannedPlans.length}</strong></div>
              <div className="stat-card"><span>已记录投入</span><strong>{formatDuration(activeSeconds)}</strong></div>
              <div className="stat-card"><span>进行中专注</span><strong>{runningSessions.length}</strong></div>
            </section>

            <div className="content-grid">
              <section className="panel">
                <div className="panel-heading">
                  <div><div className="eyebrow">TASK INBOX</div><h2>任务</h2></div>
                  <button className="text-button" onClick={() => setShowTrash((value) => !value)}>
                    {showTrash ? "返回任务列表" : "回收站 " + tasks.filter((task) => task.deletedAt).length}
                  </button>
                </div>

                {!showTrash && (
                  <form className="create-form" onSubmit={(event) => void handleCreateTask(event)}>
                    <label>
                      <span>任务名称</span>
                      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：完善 RINGS v1.0 数据层" required maxLength={120} />
                    </label>
                    <label>
                      <span>说明（可选）</span>
                      <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="补充任务上下文…" rows={2} />
                    </label>
                    <button className="primary-button" type="submit" disabled={busy || !title.trim()}>创建任务</button>
                  </form>
                )}

                <div className="task-list">
                  {visibleTasks.length === 0 ? (
                    <div className="empty-state">{showTrash ? "回收站为空。" : "还没有任务，先创建一条任务。"}</div>
                  ) : visibleTasks.map((task) => {
                    const running = taskSession(task.id);
                    const terminal = ["completed", "cancelled", "archived"].includes(task.status);
                    return (
                      <article className="task-row" key={task.id}>
                        <div className="task-main">
                          <div className="task-title">{task.title}</div>
                          {task.description && <div className="task-description">{task.description}</div>}
                          <div className="task-meta">
                            <span className={"status-chip " + task.status}>{taskStatusLabel(task)}</span>
                            <span>{task.priority === "normal" ? "普通优先级" : task.priority}</span>
                            {task.deadlineAt && <span>期限 {formatDate(task.deadlineAt)}</span>}
                          </div>
                        </div>
                        <div className="task-actions">
                          {showTrash ? (
                            <button className="small-button" onClick={() => void runAction((target) => target.restoreTask(task.id))}>恢复</button>
                          ) : (
                            <>
                              {running ? (
                                <button className="small-button focus-active" onClick={() => void runAction(async (target) => { await target.finishWorkSession(running.id); })}>结束专注</button>
                              ) : (
                                <button className="small-button" disabled={busy || terminal} onClick={() => void runAction(async (target) => { await target.startWorkSession(task.id); })}>专注</button>
                              )}
                              <button className="small-button" disabled={busy || terminal} onClick={() => void runAction((target) => target.completeTask(task.id))}>完成</button>
                              <button className="icon-button" title="移入回收站" disabled={busy} onClick={() => {
                                if (window.confirm("将任务移入回收站？关联计划和执行记录会保留。")) {
                                  void runAction((target) => target.softDeleteTask(task.id));
                                }
                              }}>×</button>
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <div className="right-column">
                <section className="panel">
                  <div className="panel-heading"><div><div className="eyebrow">SCHEDULING</div><h2>安排计划</h2></div></div>
                  <form className="schedule-form" onSubmit={(event) => void handleSchedule(event)}>
                    <label>
                      <span>选择任务</span>
                      <select value={scheduleTaskId} onChange={(event) => setScheduleTaskId(event.target.value)} required>
                        <option value="" disabled>选择一项任务</option>
                        {activeTasks.filter((task) => !["completed", "cancelled", "archived"].includes(task.status)).map((task) => (
                          <option key={task.id} value={task.id}>{task.title}</option>
                        ))}
                      </select>
                    </label>
                    <div className="field-pair">
                      <label><span>开始时间</span><input type="datetime-local" value={planStart} onChange={(event) => setPlanStart(event.target.value)} required /></label>
                      <label><span>结束时间</span><input type="datetime-local" value={planEnd} onChange={(event) => setPlanEnd(event.target.value)} required /></label>
                    </div>
                    <button className="primary-button" type="submit" disabled={busy || !scheduleTaskId}>保存计划</button>
                    <p className="helper-text">时间重叠会先提醒；确认后才允许保存，不会自动挪动其他计划。</p>
                  </form>
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <div><div className="eyebrow">PLAN TIMELINE</div><h2>近期计划</h2></div>
                    <span className="count-badge">{plannedPlans.length}</span>
                  </div>
                  <div className="plan-list">
                    {plannedPlans.length === 0 ? <div className="empty-state compact">还没有已安排计划。</div> :
                      plannedPlans.map((plan) => (
                        <div className="plan-row" key={plan.id}>
                          <div className="plan-time"><strong>{formatDate(plan.startAt)}</strong><span>至 {formatDate(plan.endAt)}</span></div>
                          <div className="plan-task">{taskById.get(plan.taskId)?.title ?? "关联任务不可用"}</div>
                          <button className="icon-button" title="取消计划" onClick={() => void runAction((target) => target.cancelPlan(plan.id))}>×</button>
                        </div>
                      ))}
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <div><div className="eyebrow">WORK SESSIONS</div><h2>实际执行记录</h2></div>
                    <span className="count-badge">{sessions.length}</span>
                  </div>
                  <div className="session-list">
                    {sessions.length === 0 ? <div className="empty-state compact">开始一次专注后，这里会记录实际投入。</div> :
                      sessions.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 5).map((session) => (
                        <div className="session-row" key={session.id}>
                          <div><strong>{taskById.get(session.taskId)?.title ?? "已删除任务"}</strong><span>{formatDate(session.startedAt)}</span></div>
                          <span className={session.endedAt ? "session-duration" : "session-running"}>
                            {session.endedAt ? formatDuration(session.actualSeconds) : "进行中"}
                          </span>
                        </div>
                      ))}
                  </div>
                </section>
              </div>
            </div>
          </>
        )}

        <footer className="app-footer">
          <span>RINGS v1.0 · 双端共用业务层</span>
          <span>{platform} / {storage} · 本地优先 · 暂无云同步</span>
        </footer>
      </main>
    </div>
  );
}
