import { Module } from "@nestjs/common";
import { prisma } from "@novaris/database";
import { createFeatureFlagRepository, SetFeatureFlagHandler, GetFeatureFlagHandler } from "@novaris/feature-flags";
import { AuthModule } from "../auth/auth.module.js";
import { FeatureFlagController } from "./feature-flag.controller.js";

const FEATURE_FLAG_REPOSITORY = "FEATURE_FLAG_REPOSITORY";

/**
 * FeatureFlagModule — Composition Root de `feature-flags` (`ADR-0038`, `ENG-0140`).
 */
@Module({
  imports: [AuthModule],
  controllers: [FeatureFlagController],
  providers: [
    { provide: FEATURE_FLAG_REPOSITORY, useFactory: () => createFeatureFlagRepository(prisma) },
    {
      provide: SetFeatureFlagHandler,
      useFactory: (repository: ReturnType<typeof createFeatureFlagRepository>) => new SetFeatureFlagHandler(repository),
      inject: [FEATURE_FLAG_REPOSITORY],
    },
    {
      provide: GetFeatureFlagHandler,
      useFactory: (repository: ReturnType<typeof createFeatureFlagRepository>) => new GetFeatureFlagHandler(repository),
      inject: [FEATURE_FLAG_REPOSITORY],
    },
  ],
})
export class FeatureFlagModule {}
