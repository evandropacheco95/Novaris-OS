import type { PrismaClient } from "@novaris/database";
import { PrismaFeatureFlagRepository } from "./repositories/prisma-feature-flag-repository.js";

export function createFeatureFlagRepository(prisma: PrismaClient): PrismaFeatureFlagRepository {
  return new PrismaFeatureFlagRepository(prisma);
}
