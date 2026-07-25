import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { FeatureFlag } from "../../../domain/aggregates/feature-flag/feature-flag.js";
import type { FeatureFlagRepository } from "../../../domain/repositories/feature-flag-repository.js";
import type { SetFeatureFlagCommand } from "../../commands/set-feature-flag/set-feature-flag.command.js";

/**
 * SetFeatureFlagHandler — Application Layer, `feature-flags` (`ADR-0038`).
 * Upsert real, mesmo padrão de `SetConfigurationEntryHandler`.
 */
export class SetFeatureFlagHandler {
  constructor(private readonly repository: FeatureFlagRepository) {}

  async execute(command: SetFeatureFlagCommand): Promise<Result<FeatureFlag, DomainError | InfrastructureError>> {
    const organizationId = new UniqueEntityId(command.organizationId);
    const existingResult = await this.repository.findByOrganizationAndKey(organizationId, command.key);
    if (existingResult.isFailure) {
      return Result.fail(existingResult.getError()!);
    }

    const existingOption = existingResult.getValue()!;
    if (existingOption.isSome) {
      const flag = existingOption.getOrElse(null as never);
      flag.setEnabled(command.enabled);
      const saveResult = await this.repository.save(flag);
      if (saveResult.isFailure) {
        return Result.fail(saveResult.getError()!);
      }
      return Result.ok(flag);
    }

    const createResult = FeatureFlag.create({ organizationId, key: command.key, enabled: command.enabled });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const flag = createResult.getValue()!;
    const saveResult = await this.repository.save(flag);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }
    return Result.ok(flag);
  }
}
