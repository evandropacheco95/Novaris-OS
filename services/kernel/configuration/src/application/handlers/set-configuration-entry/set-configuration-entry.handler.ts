import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { ConfigurationEntry } from "../../../domain/aggregates/configuration-entry/configuration-entry.js";
import type { ConfigurationEntryRepository } from "../../../domain/repositories/configuration-entry-repository.js";
import type { SetConfigurationEntryCommand } from "../../commands/set-configuration-entry/set-configuration-entry.command.js";

/**
 * SetConfigurationEntryHandler — Application Layer, `configuration`
 * (`ADR-0038`). Upsert real: busca por `(organizationId, key)`, atualiza se
 * existe, cria se não existe — nunca duplica linha (unicidade garantida
 * também pelo índice único da tabela, `ENG-0140`).
 */
export class SetConfigurationEntryHandler {
  constructor(private readonly repository: ConfigurationEntryRepository) {}

  async execute(command: SetConfigurationEntryCommand): Promise<Result<ConfigurationEntry, DomainError | InfrastructureError>> {
    const organizationId = new UniqueEntityId(command.organizationId);
    const existingResult = await this.repository.findByOrganizationAndKey(organizationId, command.key);
    if (existingResult.isFailure) {
      return Result.fail(existingResult.getError()!);
    }

    const existingOption = existingResult.getValue()!;
    if (existingOption.isSome) {
      const entry = existingOption.getOrElse(null as never);
      entry.updateValue(command.value);
      const saveResult = await this.repository.save(entry);
      if (saveResult.isFailure) {
        return Result.fail(saveResult.getError()!);
      }
      return Result.ok(entry);
    }

    const createResult = ConfigurationEntry.create({ organizationId, key: command.key, value: command.value });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const entry = createResult.getValue()!;
    const saveResult = await this.repository.save(entry);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }
    return Result.ok(entry);
  }
}
