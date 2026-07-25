import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Campaign } from "../aggregates/campaign/campaign.js";

/** Contrato de persistência do Aggregate `Campaign` — port da Domain Layer. Mesmo padrão de `SubscriptionRepository`. */
export interface CampaignRepository extends ReadRepository<Campaign>, WriteRepository<Campaign> {}
