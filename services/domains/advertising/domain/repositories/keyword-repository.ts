import type { ReadRepository, WriteRepository, Result, Option, InfrastructureError, UniqueEntityId } from "@novaris/shared-kernel";
import type { Keyword } from "../aggregates/keyword/keyword.js";

/** Contrato de persistência do Aggregate `Keyword`. Mesmo padrão de `AdCampaignRepository`. */
export interface KeywordRepository extends ReadRepository<Keyword>, WriteRepository<Keyword> {
  findByExternalCriterionId(
    advertisingAccountId: UniqueEntityId,
    externalCriterionId: string,
  ): Promise<Result<Option<Keyword>, InfrastructureError>>;
}
