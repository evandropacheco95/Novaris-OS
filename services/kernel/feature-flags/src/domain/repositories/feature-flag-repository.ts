import type { ReadRepository, WriteRepository, UniqueEntityId, Result, Option, InfrastructureError } from "@novaris/shared-kernel";
import type { FeatureFlag } from "../aggregates/feature-flag/feature-flag.js";

export interface FeatureFlagRepository extends ReadRepository<FeatureFlag>, WriteRepository<FeatureFlag> {
  findByOrganizationAndKey(organizationId: UniqueEntityId, key: string): Promise<Result<Option<FeatureFlag>, InfrastructureError>>;
}
