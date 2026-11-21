import type { Plan, Task, WorkSession } from "@rings/domain";

export interface RingsRepository {
  initialize(): Promise<void>;
  listTasks(includeDeleted?: boolean): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  saveTask(task: Task): Promise<void>;
  listPlans(): Promise<Plan[]>;
  savePlan(plan: Plan): Promise<void>;
  listWorkSessions(): Promise<WorkSession[]>;
  startWorkSession(session: WorkSession): Promise<void>;
  finishWorkSession(session: WorkSession): Promise<void>;
}
