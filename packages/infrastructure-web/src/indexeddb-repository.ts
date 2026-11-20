import type { RingsRepository } from "@rings/application";
import type { Plan, Task, WorkSession } from "@rings/domain";

const DATABASE_NAME = "rings-v1";
const DATABASE_VERSION = 1;

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB 请求失败。"));
  });
}

function transactionResult(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB 事务失败。"));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB 事务已中止。"));
  });
}

export class IndexedDbRingsRepository implements RingsRepository {
  private databasePromise: Promise<IDBDatabase> | null = null;

  async initialize(): Promise<void> {
    if (!this.databasePromise) {
      this.databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains("tasks")) {
            const store = database.createObjectStore("tasks", { keyPath: "id" });
            store.createIndex("updatedAt", "updatedAt");
            store.createIndex("deletedAt", "deletedAt");
          }
          if (!database.objectStoreNames.contains("plans")) {
            const store = database.createObjectStore("plans", { keyPath: "id" });
            store.createIndex("taskId", "taskId");
            store.createIndex("status", "status");
          }
          if (!database.objectStoreNames.contains("workSessions")) {
            const store = database.createObjectStore("workSessions", { keyPath: "id" });
            store.createIndex("taskId", "taskId");
            store.createIndex("endedAt", "endedAt");
          }
        };
        request.onsuccess = () => {
          request.result.onversionchange = () => request.result.close();
          resolve(request.result);
        };
        request.onerror = () => reject(request.error ?? new Error("无法打开本地数据库。"));
        request.onblocked = () => reject(new Error("数据库升级被其他打开的 RINGS 页面阻塞。"));
      });
    }
    await this.databasePromise;
  }

  private async database(): Promise<IDBDatabase> {
    if (!this.databasePromise) await this.initialize();
    return this.databasePromise!;
  }

  async listTasks(includeDeleted = false): Promise<Task[]> {
    const database = await this.database();
    const transaction = database.transaction("tasks", "readonly");
    const rows = await requestResult<Task[]>(transaction.objectStore("tasks").getAll());
    return rows
      .filter((task) => includeDeleted || !task.deletedAt)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getTask(id: string): Promise<Task | null> {
    const database = await this.database();
    const transaction = database.transaction("tasks", "readonly");
    return (await requestResult<Task | undefined>(transaction.objectStore("tasks").get(id))) ?? null;
  }

  async saveTask(task: Task): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction("tasks", "readwrite");
    transaction.objectStore("tasks").put(task);
    await transactionResult(transaction);
  }

  async listPlans(): Promise<Plan[]> {
    const database = await this.database();
    const transaction = database.transaction("plans", "readonly");
    return requestResult<Plan[]>(transaction.objectStore("plans").getAll());
  }

  async savePlan(plan: Plan): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction("plans", "readwrite");
    transaction.objectStore("plans").put(plan);
    await transactionResult(transaction);
  }

  async listWorkSessions(): Promise<WorkSession[]> {
    const database = await this.database();
    const transaction = database.transaction("workSessions", "readonly");
    return requestResult<WorkSession[]>(transaction.objectStore("workSessions").getAll());
  }

  async startWorkSession(session: WorkSession): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction("workSessions", "readwrite");
    const done = transactionResult(transaction);
    const store = transaction.objectStore("workSessions");
    const request = store.index("taskId").getAll(session.taskId);
    request.onsuccess = () => {
      const active = (request.result as WorkSession[]).some((item) => !item.endedAt);
      if (active) {
        transaction.abort();
        return;
      }
      store.add(session);
    };
    await done;
  }

  async finishWorkSession(session: WorkSession): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction("workSessions", "readwrite");
    const done = transactionResult(transaction);
    const store = transaction.objectStore("workSessions");
    const request = store.get(session.id);
    request.onsuccess = () => {
      const existing = request.result as WorkSession | undefined;
      if (!existing || existing.endedAt) {
        transaction.abort();
        return;
      }
      store.put(session);
    };
    await done;
  }
}
