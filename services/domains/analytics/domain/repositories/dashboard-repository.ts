import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Dashboard } from "../aggregates/dashboard/dashboard.js";

/** Contrato de persistência do Aggregate `Dashboard` — port da Domain Layer. Mesmo padrão de `SubscriptionRepository`/`CampaignRepository`. */
export interface DashboardRepository extends ReadRepository<Dashboard>, WriteRepository<Dashboard> {}
