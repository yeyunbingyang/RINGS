export interface WorkSession {
  id: string;
  taskId: string;
  startedAt: string;
  endedAt: string | null;
  actualSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export function createWorkSession(
  taskId: string,
  now = new Date().toISOString(),
  id = globalThis.crypto.randomUUID()
): WorkSession {
  return {
    id,
    taskId,
    startedAt: now,
    endedAt: null,
    actualSeconds: 0,
    createdAt: now,
    updatedAt: now
  };
}

export function finishWorkSession(
  session: WorkSession,
  endedAt = new Date().toISOString()
): WorkSession {
  if (session.endedAt) throw new Error("该执行记录已经结束。");

  const duration = Math.floor(
    (Date.parse(endedAt) - Date.parse(session.startedAt)) / 1000
  );
  if (!Number.isFinite(duration) || duration < 0) {
    throw new Error("执行结束时间不能早于开始时间。");
  }

  return {
    ...session,
    endedAt,
    actualSeconds: duration,
    updatedAt: endedAt
  };
}
