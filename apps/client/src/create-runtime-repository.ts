import { isTauri } from "@tauri-apps/api/core";
import type { RingsRepository } from "@rings/application";
import { IndexedDbRingsRepository } from "@rings/infrastructure-web";

export interface RuntimeRepository {
  repository: RingsRepository;
  platform: "Web" | "Desktop";
  storage: "IndexedDB" | "SQLite";
}

export async function createRuntimeRepository(): Promise<RuntimeRepository> {
  if (isTauri()) {
    const { TauriSqliteRingsRepository } = await import("@rings/infrastructure-desktop");
    return {
      repository: new TauriSqliteRingsRepository(),
      platform: "Desktop",
      storage: "SQLite"
    };
  }

  return {
    repository: new IndexedDbRingsRepository(),
    platform: "Web",
    storage: "IndexedDB"
  };
}
