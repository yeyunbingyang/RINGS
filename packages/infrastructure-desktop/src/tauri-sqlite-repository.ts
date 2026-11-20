import Database from "@tauri-apps/plugin-sql";
import type { RingsRepository } from "@rings/application";
import type { Plan, Task, WorkSession } from "@rings/domain";

type SqlDatabase = Awaited<ReturnType<typeof Database.load>>;

interface TaskRow {
  id: string;
  parent_task_id: string | null;
  goal_id: string | null;
  stage_id: string | null;
  title: string;
  description: string;
  priority: Task["priority"];
  status: Task["status"];
  deadline_at: string | null;
  estimate_minutes: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface PlanRow {
  id: string;
  task_id: string;
  plan_date: string;
  start_at: string | null;
  end_at: string | null;
  timezone: string;
  status: Plan["status"];
  previous_plan_id: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkSessionRow {
  id: string;
  task_id: string;
  started_at: string;
  ended_at: string | null;
  actual_seconds: number;
  created_at: string;
  updated_at: string;
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    parentTaskId: row.parent_task_id,
    goalId: row.goal_id,
    stageId: row.stage_id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    deadlineAt: row.deadline_at,
    estimateMinutes: row.estimate_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at
  };
}

function mapPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    taskId: row.task_id,
    planDate: row.plan_date,
    startAt: row.start_at,
    endAt: row.end_at,
    timezone: row.timezone,
    status: row.status,
    previousPlanId: row.previous_plan_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapSession(row: WorkSessionRow): WorkSession {
  return {
    id: row.id,
    taskId: row.task_id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    actualSeconds: row.actual_seconds,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class TauriSqliteRingsRepository implements RingsRepository {
  private database: SqlDatabase | null = null;

  async initialize(): Promise<void> {
    if (this.database) return;
    this.database = await Database.load("sqlite:rings.db");
    await this.database.execute("PRAGMA foreign_keys = ON");
  }

  private get db(): SqlDatabase {
    if (!this.database) throw new Error("SQLite 尚未初始化。");
    return this.database;
  }

  async listTasks(includeDeleted = false): Promise<Task[]> {
    const sql = includeDeleted
      ? "SELECT * FROM tasks ORDER BY updated_at DESC"
      : "SELECT * FROM tasks WHERE deleted_at IS NULL ORDER BY updated_at DESC";
    const rows = await this.db.select<TaskRow[]>(sql);
    return rows.map(mapTask);
  }

  async getTask(id: string): Promise<Task | null> {
    const rows = await this.db.select<TaskRow[]>(
      "SELECT * FROM tasks WHERE id = $1 LIMIT 1",
      [id]
    );
    return rows[0] ? mapTask(rows[0]) : null;
  }

  async saveTask(task: Task): Promise<void> {
    await this.db.execute(
      "INSERT INTO tasks (id,parent_task_id,goal_id,stage_id,title,description,priority,status,deadline_at,estimate_minutes,created_at,updated_at,deleted_at) " +
      "VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) " +
      "ON CONFLICT(id) DO UPDATE SET parent_task_id=excluded.parent_task_id,goal_id=excluded.goal_id,stage_id=excluded.stage_id,title=excluded.title,description=excluded.description,priority=excluded.priority,status=excluded.status,deadline_at=excluded.deadline_at,estimate_minutes=excluded.estimate_minutes,updated_at=excluded.updated_at,deleted_at=excluded.deleted_at",
      [
        task.id, task.parentTaskId, task.goalId, task.stageId, task.title,
        task.description, task.priority, task.status, task.deadlineAt,
        task.estimateMinutes, task.createdAt, task.updatedAt, task.deletedAt
      ]
    );
  }

  async listPlans(): Promise<Plan[]> {
    const rows = await this.db.select<PlanRow[]>(
      "SELECT * FROM plans ORDER BY plan_date, start_at"
    );
    return rows.map(mapPlan);
  }

  async savePlan(plan: Plan): Promise<void> {
    await this.db.execute(
      "INSERT INTO plans (id,task_id,plan_date,start_at,end_at,timezone,status,previous_plan_id,created_at,updated_at) " +
      "VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) " +
      "ON CONFLICT(id) DO UPDATE SET task_id=excluded.task_id,plan_date=excluded.plan_date,start_at=excluded.start_at,end_at=excluded.end_at,timezone=excluded.timezone,status=excluded.status,previous_plan_id=excluded.previous_plan_id,updated_at=excluded.updated_at",
      [
        plan.id, plan.taskId, plan.planDate, plan.startAt, plan.endAt,
        plan.timezone, plan.status, plan.previousPlanId, plan.createdAt, plan.updatedAt
      ]
    );
  }

  async listWorkSessions(): Promise<WorkSession[]> {
    const rows = await this.db.select<WorkSessionRow[]>(
      "SELECT * FROM work_sessions ORDER BY started_at DESC"
    );
    return rows.map(mapSession);
  }

  async startWorkSession(session: WorkSession): Promise<void> {
    const result = await this.db.execute(
      "INSERT INTO work_sessions (id,task_id,started_at,ended_at,actual_seconds,created_at,updated_at) " +
      "SELECT $1,$2,$3,NULL,0,$4,$5 " +
      "WHERE EXISTS (SELECT 1 FROM tasks WHERE id=$2 AND deleted_at IS NULL AND status NOT IN ('completed','cancelled','archived')) " +
      "AND NOT EXISTS (SELECT 1 FROM work_sessions WHERE task_id=$2 AND ended_at IS NULL)",
      [session.id, session.taskId, session.startedAt, session.createdAt, session.updatedAt]
    );
    if (result.rowsAffected !== 1) {
      throw new Error("任务不存在、不可执行，或已有进行中的专注记录。");
    }
  }

  async finishWorkSession(session: WorkSession): Promise<void> {
    const result = await this.db.execute(
      "UPDATE work_sessions SET ended_at=$1,actual_seconds=$2,updated_at=$3 WHERE id=$4 AND ended_at IS NULL",
      [session.endedAt, session.actualSeconds, session.updatedAt, session.id]
    );
    if (result.rowsAffected !== 1) {
      throw new Error("执行记录已结束或不存在，未覆盖原始记录。");
    }
  }
}
