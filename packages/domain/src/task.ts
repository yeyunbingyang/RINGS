export const TASK_STATUSES = [
  "open", "in_progress", "blocked", "completed", "cancelled", "archived"
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export const TASK_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface Task {
  id: string;
  parentTaskId: string | null;
  goalId: string | null;
  stageId: string | null;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadlineAt: string | null;
  estimateMinutes: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export function createTask(
  title: string,
  description = "",
  now = new Date().toISOString(),
  id = globalThis.crypto.randomUUID()
): Task {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) throw new Error("任务名称不能为空。");

  return {
    id,
    parentTaskId: null,
    goalId: null,
    stageId: null,
    title: normalizedTitle,
    description: description.trim(),
    priority: "normal",
    status: "open",
    deadlineAt: null,
    estimateMinutes: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  };
}
