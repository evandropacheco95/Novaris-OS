import type { PrismaClient } from "@novaris/database";
import { PrismaConfigurationEntryRepository } from "./repositories/prisma-configuration-entry-repository.js";

export function createConfigurationEntryRepository(prisma: PrismaClient): PrismaConfigurationEntryRepository {
  return new PrismaConfigurationEntryRepository(prisma);
}
