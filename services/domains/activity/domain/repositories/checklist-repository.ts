import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Checklist } from "../aggregates/checklist/checklist.js";

/** Contrato de persistência do Aggregate `Checklist` (`ADR-0045`). */
export interface ChecklistRepository extends ReadRepository<Checklist>, WriteRepository<Checklist> {}
