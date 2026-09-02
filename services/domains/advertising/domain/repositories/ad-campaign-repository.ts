import type { ReadRepository, WriteRepository, Result, Option, InfrastructureError, UniqueEntityId } from "@novaris/shared-kernel";
import type { AdCampaign } from "../aggregates/ad-campaign/ad-campaign.js";

/**
 * Contrato de persistência do Aggregate `AdCampaign`. `findByExternalCampaignId`
 * é o que permite à Application Layer resolver criação vs. `applySync()`
 * durante a sincronização (`ADR-0060`).
 */
export interface AdCampaignRepository extends ReadRepository<AdCampaign>, WriteRepository<AdCampaign> {
  findByExternalCampaignId(
    advertisingAccountId: UniqueEntityId,
    externalCampaignId: string,
  ): Promise<Result<Option<AdCampaign>, InfrastructureError>>;
}
