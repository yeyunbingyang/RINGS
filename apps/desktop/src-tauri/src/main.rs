use tauri_plugin_sql::{Migration, MigrationKind};

fn main() {
    let migrations = vec![Migration {
        version: 1,
        description: "create_core_task_plan_session_tables",
        sql: include_str!("../migrations/0001_core.sql"),
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:rings.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("failed to run RINGS desktop application");
}
