import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Result, Option, InfrastructureError } from "@novaris/shared-kernel";
import type { ConfigurationEntry } from "../../../domain/aggregates/configuration-entry/configuration-entry.js";
import type { ConfigurationEntryRepository } from "../../../domain/repositories/configuration-entry-repository.js";
import type { GetConfigurationEntryCommand } from "../../commands/get-configuration-entry/get-configuration-entry.command.js";

export class GetConfigurationEntryHandler {
  constructor(private readonly repository: ConfigurationEntryRepository) {}

  async execute(command: GetConfigurationEntryCommand): Promise<Result<Option<ConfigurationEntry>, InfrastructureError>> {
    return this.repository.findByOrganizationAndKey(new UniqueEntityId(command.organizationId), command.key);
  }
}
