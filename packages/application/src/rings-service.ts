import {
  createPlan,
  createTask,
  createWorkSession,
  finishWorkSession as finishSessionEntity
} from "@rings/domain";
import type { NewPlanInput, Plan, Task, WorkSession } from "@rings/domain";
import type { RingsRepository } from "./repository";

export class PlanConflictError extends Error {
  readonly conflicts: Plan[];

  constructor(conflicts: Plan[]) {
    super("该时间段与已有计划重叠。");
    this.name = "PlanConflictError";
    this.conflicts = conflicts;
  }
}

export class RingsService {
  constructor(private readonly repository: RingsRepository) {}

  listTasks(includeDeleted = false): Promise<Task[]> {
    return this.repository.listTasks(includeDeleted);
  }

  listPlans(): Promise<Plan[]> {
    return this.repository.listPlans();
  }

  listWorkSessions(): Promise<WorkSession[]> {
    return this.repository.listWorkSessions();
  }

  async createTask(title: string, description = ""): Promise<Task> {
    const task = createTask(title, description);
    await this.repository.saveTask(task);
    return task;
  }

  async scheduleTask(input: NewPlanInput, allowConflicts = false): Promise<Plan> {
    const task = await this.repository.getTask(input.taskId);
    if (!task || task.deletedAt) throw new Error("找不到可安排的任务。");
    if (["completed", "cancelled", "archived"].includes(task.status)) {
      throw new Error("已完成、已取消或已归档的任务不能新增计划。");
    }

    const candidate = createPlan(input);
    const conflicts = (await this.repository.listPlans()).filter((plan) => {
      if (plan.status !== "planned" || !plan.startAt || !plan.endAt) return false;
      return (
        Date.parse(candidate.startAt!) < Date.parse(plan.endAt) &&
        Date.parse(candidate.endAt!) > Date.parse(plan.startAt)
      );
    });

    if (conflicts.length > 0 && !allowConflicts) throw new PlanConflictError(conflicts);
    await this.repository.savePlan(candidate);
    return candidate;
  }

  async cancelPlan(planId: string): Promise<void> {
    const plan = (await this.repository.listPlans()).find((item) => item.id === planId);
    if (!plan) throw new Error("找不到该计划。");
    if (plan.status !== "planned") throw new Error("只有待执行计划可以取消.");
    await this.repository.savePlan({
      ...plan,
      status: "cancelled",
      updatedAt: new Date().toISOString()
    });
  }

  async startWorkSession(taskId: string): Promise<WorkSession> {
    const task = await this.repository.getTask(taskId);
    if (!task || task.deletedAt) throw new Error("找不到可执行的任务。");
    if (["completed", "cancelled", "archived"].includes(task.status)) {
      throw new Error("该任务当前状态不能开始专注。");
    }

    const existing = (await this.repository.listWorkSessions()).some(
      (session) => session.taskId === taskId && !session.endedAt
    );
    if (existing) throw new Error("该任务已有一条进行中的专注记录。");

    const session = createWorkSession(taskId);
    await this.repository.startWorkSession(session);
    return session;
  }

  async finishWorkSession(sessionId: string): Promise<WorkSession> {
    const session = (await this.repository.listWorkSessions()).find(
      (item) => item.id === sessionId
    );
    if (!session) throw new Error("找不到该执行记录。");

    const finished = finishSessionEntity(session);
    await this.repository.finishWorkSession(finished);
    return finished;
  }

  async completeTask(taskId: string): Promise<void> {
    const task = await this.repository.getTask(taskId);
    if (!task || task.deletedAt) throw new Error("找不到该任务。");
    const activeSession = (await this.repository.listWorkSessions()).some(
      (session) => session.taskId === taskId && !session.endedAt
    );
    if (activeSession) throw new Error("请先结束专注记录，再完成任务。");

    await this.repository.saveTask({
      ...task,
      status: "completed",
      updatedAt: new Date().toISOString()
    });
  }

  async softDeleteTask(taskId: string): Promise<void> {
    const task = await this.repository.getTask(taskId);
    if (!task || task.deletedAt) throw new Error("找不到可删除的任务。");
    const activeSession = (await this.repository.listWorkSessions()).some(
      (session) => session.taskId === taskId && !session.endedAt
    );
    if (activeSession) throw new Error("请先结束专注记录，再移入回收站。");

    const now = new Date().toISOString();
    await this.repository.saveTask({ ...task, deletedAt: now, updatedAt: now });
  }

  async restoreTask(taskId: string): Promise<void> {
    const task = await this.repository.getTask(taskId);
    if (!task || !task.deletedAt) throw new Error("找不到待恢复的任务。");
    await this.repository.saveTask({
      ...task,
      deletedAt: null,
      updatedAt: new Date().toISOString()
    });
  }
}
