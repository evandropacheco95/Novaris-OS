import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Case } from "../aggregates/case/case.js";

/** Contrato de persistência do Aggregate `Case` (`ADR-0043`). */
export interface CaseRepository extends ReadRepository<Case>, WriteRepository<Case> {}
