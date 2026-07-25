// Feature Flags Service — barrel de exportação pública.

export {
  FeatureFlag,
  type FeatureFlagProps,
  type CreateFeatureFlagInput,
} from "./domain/aggregates/feature-flag/feature-flag.js";
export type { FeatureFlagRepository } from "./domain/repositories/feature-flag-repository.js";

export { SetFeatureFlagCommand } from "./application/commands/set-feature-flag/set-feature-flag.command.js";
export { SetFeatureFlagHandler } from "./application/handlers/set-feature-flag/set-feature-flag.handler.js";
export { GetFeatureFlagCommand } from "./application/commands/get-feature-flag/get-feature-flag.command.js";
export { GetFeatureFlagHandler } from "./application/handlers/get-feature-flag/get-feature-flag.handler.js";

export { createFeatureFlagRepository } from "./infrastructure/factories.js";
