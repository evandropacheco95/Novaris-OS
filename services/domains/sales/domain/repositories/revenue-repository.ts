import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Revenue } from "../aggregates/revenue/revenue.js";

/** Contrato de persistência do Aggregate `Revenue` (`ADR-0047`). */
export interface RevenueRepository extends ReadRepository<Revenue>, WriteRepository<Revenue> {}
