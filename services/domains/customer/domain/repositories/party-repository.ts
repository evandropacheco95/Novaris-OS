import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Party } from "../aggregates/party/party.js";

/**
 * Contrato de persistência do Aggregate `Party` — port da Domain Layer.
 * Composição idêntica ao padrão já congelado em `OpportunityRepository`
 * (Sales, `ENG-0037`): apenas `ReadRepository<Party>` + `WriteRepository<Party>`
 * do Shared Kernel, sem nenhum método próprio.
 */
export interface PartyRepository extends ReadRepository<Party>, WriteRepository<Party> {}
