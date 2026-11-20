import { beforeEach, describe, expect, it } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { PlanConflictError, RingsService } from "@rings/application";
import { IndexedDbRingsRepository } from "@rings/infrastructure-web";

function planInput(taskId: string, startAt: string, endAt: string) {
  return {
    taskId,
    planDate: "2026-11-21",
    startAt,
    endAt,
    timezone: "Asia/Singapore"
  };
}

async function createTestService() {
  const repository = new IndexedDbRingsRepository();
  await repository.initialize();
  return { repository, service: new RingsService(repository) };
}

beforeEach(() => {
  Object.defineProperty(globalThis, "indexedDB", {
    configurable: true,
    value: new IDBFactory()
  });
});

describe("RINGS v1.0 Task / Plan / WorkSession foundation", () => {
  it("creates tasks and requires explicit confirmation for overlapping plans", async () => {
    const { service } = await createTestService();
    const firstTask = await service.createTask("  完成双端验收  ");
    const secondTask = await service.createTask("补充自动化测试");

    expect(firstTask.title).toBe("完成双端验收");

    const firstPlan = await service.scheduleTask(planInput(
      firstTask.id,
      "2026-11-21T02:00:00.000Z",
      "2026-11-21T03:00:00.000Z"
    ));

    await expect(service.scheduleTask(planInput(
      secondTask.id,
      "2026-11-21T02:30:00.000Z",
      "2026-11-21T03:30:00.000Z"
    ))).rejects.toBeInstanceOf(PlanConflictError);

    await service.cancelPlan(firstPlan.id);
    const nextPlan = await service.scheduleTask(planInput(
      secondTask.id,
      "2026-11-21T02:30:00.000Z",
      "2026-11-21T03:30:00.000Z"
    ));

    expect(nextPlan.status).toBe("planned");
    const statuses = (await service.listPlans()).map((plan) => plan.status).sort();
    expect(statuses).toEqual(["cancelled", "planned"]);
  });

  it("prevents concurrent active sessions and records actual execution", async () => {
    const { service } = await createTestService();
    const task = await service.createTask("完成执行闭环");

    const attempts = await Promise.allSettled([
      service.startWorkSession(task.id),
      service.startWorkSession(task.id)
    ]);

    const succeeded = attempts.filter(
      (attempt): attempt is PromiseFulfilledResult<Awaited<ReturnType<typeof service.startWorkSession>>> =>
        attempt.status === "fulfilled"
    );
    const rejected = attempts.filter((attempt) => attempt.status === "rejected");

    expect(succeeded).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const session = succeeded[0].value;
    await expect(service.completeTask(task.id)).rejects.toThrow("请先结束专注记录");

    const finished = await service.finishWorkSession(session.id);
    expect(finished.endedAt).not.toBeNull();
    expect(finished.actualSeconds).toBeGreaterThanOrEqual(0);

    await service.completeTask(task.id);
    expect((await service.listTasks())[0].status).toBe("completed");
  });

  it("soft-deletes and restores a task without removing plans or execution history", async () => {
    const { service } = await createTestService();
    const task = await service.createTask("验证回收站保留关系");

    await service.scheduleTask(planInput(
      task.id,
      "2026-11-21T05:00:00.000Z",
      "2026-11-21T05:30:00.000Z"
    ));
    const session = await service.startWorkSession(task.id);
    await service.finishWorkSession(session.id);

    await service.softDeleteTask(task.id);

    expect(await service.listTasks()).toHaveLength(0);
    expect((await service.listTasks(true))[0].deletedAt).not.toBeNull();
    expect(await service.listPlans()).toHaveLength(1);
    expect(await service.listWorkSessions()).toHaveLength(1);

    await service.restoreTask(task.id);
    expect((await service.listTasks())[0].deletedAt).toBeNull();
  });

  it("restores persisted records through a newly initialized repository instance", async () => {
    const first = await createTestService();
    const task = await first.service.createTask("验证重新打开数据库");

    const secondRepository = new IndexedDbRingsRepository();
    await secondRepository.initialize();
    const restored = await secondRepository.getTask(task.id);

    expect(restored?.title).toBe("验证重新打开数据库");
  });

  it("rejects blank task titles before writing to storage", async () => {
    const { service } = await createTestService();
    await expect(service.createTask("   ")).rejects.toThrow("任务名称不能为空");
    expect(await service.listTasks()).toHaveLength(0);
  });
});
