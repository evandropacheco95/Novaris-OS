import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Result, Option, InfrastructureError } from "@novaris/shared-kernel";
import type { FeatureFlag } from "../../../domain/aggregates/feature-flag/feature-flag.js";
import type { FeatureFlagRepository } from "../../../domain/repositories/feature-flag-repository.js";
import type { GetFeatureFlagCommand } from "../../commands/get-feature-flag/get-feature-flag.command.js";

export class GetFeatureFlagHandler {
  constructor(private readonly repository: FeatureFlagRepository) {}

  async execute(command: GetFeatureFlagCommand): Promise<Result<Option<FeatureFlag>, InfrastructureError>> {
    return this.repository.findByOrganizationAndKey(new UniqueEntityId(command.organizationId), command.key);
  }
}
