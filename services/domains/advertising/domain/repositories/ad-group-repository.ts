import type { ReadRepository, WriteRepository, Result, Option, InfrastructureError, UniqueEntityId } from "@novaris/shared-kernel";
import type { AdGroup } from "../aggregates/ad-group/ad-group.js";

/** Contrato de persistência do Aggregate `AdGroup`. Mesmo padrão de `AdCampaignRepository`. */
export interface AdGroupRepository extends ReadRepository<AdGroup>, WriteRepository<AdGroup> {
  findByExternalAdGroupId(
    advertisingAccountId: UniqueEntityId,
    externalAdGroupId: string,
  ): Promise<Result<Option<AdGroup>, InfrastructureError>>;
}
