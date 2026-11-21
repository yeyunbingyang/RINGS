PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY NOT NULL,
  parent_task_id TEXT NULL REFERENCES tasks(id) ON DELETE RESTRICT,
  goal_id TEXT NULL,
  stage_id TEXT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'blocked', 'completed', 'cancelled', 'archived')),
  deadline_at TEXT NULL,
  estimate_minutes INTEGER NULL CHECK (estimate_minutes IS NULL OR estimate_minutes >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_status_updated ON tasks(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deleted ON tasks(deleted_at);

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY NOT NULL,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE RESTRICT,
  plan_date TEXT NOT NULL,
  start_at TEXT NULL,
  end_at TEXT NULL,
  timezone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'cancelled', 'completed')),
  previous_plan_id TEXT NULL REFERENCES plans(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (
    (start_at IS NULL AND end_at IS NULL)
    OR (start_at IS NOT NULL AND end_at IS NOT NULL AND start_at < end_at)
  )
);

CREATE INDEX IF NOT EXISTS idx_plans_task_status ON plans(task_id, status);
CREATE INDEX IF NOT EXISTS idx_plans_date_start ON plans(plan_date, start_at);

CREATE TABLE IF NOT EXISTS work_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE RESTRICT,
  started_at TEXT NOT NULL,
  ended_at TEXT NULL,
  actual_seconds INTEGER NOT NULL DEFAULT 0 CHECK (actual_seconds >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE INDEX IF NOT EXISTS idx_work_sessions_task_started ON work_sessions(task_id, started_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_work_sessions_one_active_per_task
  ON work_sessions(task_id) WHERE ended_at IS NULL;
