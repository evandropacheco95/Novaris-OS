import { Module } from "@nestjs/common";
import { prisma } from "@novaris/database";
import { createConfigurationEntryRepository, SetConfigurationEntryHandler, GetConfigurationEntryHandler } from "@novaris/configuration";
import { AuthModule } from "../auth/auth.module.js";
import { ConfigurationController } from "./configuration.controller.js";

const CONFIGURATION_ENTRY_REPOSITORY = "CONFIGURATION_ENTRY_REPOSITORY";

/**
 * ConfigurationModule — Composition Root de `configuration` (`ADR-0038`, `ENG-0140`).
 */
@Module({
  imports: [AuthModule],
  controllers: [ConfigurationController],
  providers: [
    { provide: CONFIGURATION_ENTRY_REPOSITORY, useFactory: () => createConfigurationEntryRepository(prisma) },
    {
      provide: SetConfigurationEntryHandler,
      useFactory: (repository: ReturnType<typeof createConfigurationEntryRepository>) => new SetConfigurationEntryHandler(repository),
      inject: [CONFIGURATION_ENTRY_REPOSITORY],
    },
    {
      provide: GetConfigurationEntryHandler,
      useFactory: (repository: ReturnType<typeof createConfigurationEntryRepository>) => new GetConfigurationEntryHandler(repository),
      inject: [CONFIGURATION_ENTRY_REPOSITORY],
    },
  ],
})
export class ConfigurationModule {}
