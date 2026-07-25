// Configuration Service — barrel de exportação pública.

export {
  ConfigurationEntry,
  type ConfigurationEntryProps,
  type CreateConfigurationEntryInput,
} from "./domain/aggregates/configuration-entry/configuration-entry.js";
export type { ConfigurationEntryRepository } from "./domain/repositories/configuration-entry-repository.js";

export { SetConfigurationEntryCommand } from "./application/commands/set-configuration-entry/set-configuration-entry.command.js";
export { SetConfigurationEntryHandler } from "./application/handlers/set-configuration-entry/set-configuration-entry.handler.js";
export { GetConfigurationEntryCommand } from "./application/commands/get-configuration-entry/get-configuration-entry.command.js";
export { GetConfigurationEntryHandler } from "./application/handlers/get-configuration-entry/get-configuration-entry.handler.js";

export { createConfigurationEntryRepository } from "./infrastructure/factories.js";
