import { isTauri } from "@tauri-apps/api/core";
import type { RingsRepository } from "@rings/application";
import { IndexedDbRingsRepository } from "@rings/infrastructure-web";

export interface RuntimeRepository {
  repository: RingsRepository;
  platform: "Web" | "Desktop";
  storage: "IndexedDB" | "SQLite";
}

let runtimePromise: Promise<RuntimeRepository> | null = null;

export function createRuntimeRepository(): Promise<RuntimeRepository> {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      if (isTauri()) {
        const { TauriSqliteRingsRepository } = await import("@rings/infrastructure-desktop");
        return {
          repository: new TauriSqliteRingsRepository(),
          platform: "Desktop" as const,
          storage: "SQLite" as const
        };
      }
      return {
        repository: new IndexedDbRingsRepository(),
        platform: "Web" as const,
        storage: "IndexedDB" as const
      };
    })().catch((cause) => {
      runtimePromise = null;
      throw cause;
    });
  }
  return runtimePromise;
}
