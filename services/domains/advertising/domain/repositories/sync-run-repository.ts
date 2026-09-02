import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { SyncRun } from "../aggregates/sync-run/sync-run.js";

/** Contrato de persistência do Aggregate `SyncRun` — sempre `INSERT`, nenhuma consulta por natural key. */
export interface SyncRunRepository extends ReadRepository<SyncRun>, WriteRepository<SyncRun> {}
