export const PLAN_STATUSES = ["planned", "cancelled", "completed"] as const;
export type PlanStatus = (typeof PLAN_STATUSES)[number];

export interface Plan {
  id: string;
  taskId: string;
  planDate: string;
  startAt: string | null;
  endAt: string | null;
  timezone: string;
  status: PlanStatus;
  previousPlanId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewPlanInput {
  taskId: string;
  planDate: string;
  startAt: string;
  endAt: string;
  timezone: string;
}

export function createPlan(
  input: NewPlanInput,
  now = new Date().toISOString(),
  id = globalThis.crypto.randomUUID()
): Plan {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.planDate)) {
    throw new Error("计划日期必须使用 YYYY-MM-DD 格式。");
  }
  if (!input.timezone.trim()) throw new Error("计划必须记录时区。");

  const start = Date.parse(input.startAt);
  const end = Date.parse(input.endAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
    throw new Error("计划结束时间必须晚于开始时间。");
  }

  return {
    id,
    taskId: input.taskId,
    planDate: input.planDate,
    startAt: new Date(start).toISOString(),
    endAt: new Date(end).toISOString(),
    timezone: input.timezone,
    status: "planned",
    previousPlanId: null,
    createdAt: now,
    updatedAt: now
  };
}
