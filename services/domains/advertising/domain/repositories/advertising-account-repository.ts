import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { AdvertisingAccount } from "../aggregates/advertising-account/advertising-account.js";

/**
 * Contrato de persistência do Aggregate `AdvertisingAccount` — port da Domain
 * Layer, mesma composição de `OrganizationRepository`/`CampaignRepository`:
 * apenas `ReadRepository<AdvertisingAccount>` + `WriteRepository<AdvertisingAccount>`,
 * sem método próprio (nenhuma consulta específica de negócio confirmada por
 * fonte ainda, ex.: buscar por `externalAccountId` — fica para a Fase 02).
 */
export interface AdvertisingAccountRepository extends ReadRepository<AdvertisingAccount>, WriteRepository<AdvertisingAccount> {}
