import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Lead } from "../aggregates/lead/lead.js";

/**
 * Contrato de persistência do Aggregate `Lead` (`ADR-0042`) — mesma
 * composição já congelada em `OpportunityRepository`: só
 * `ReadRepository<Lead>` + `WriteRepository<Lead>`, nenhum método próprio.
 */
export interface LeadRepository extends ReadRepository<Lead>, WriteRepository<Lead> {}
