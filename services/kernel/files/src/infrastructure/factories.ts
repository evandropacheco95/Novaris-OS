import type { PrismaClient } from "@novaris/database";
import { PrismaFileRecordRepository } from "./repositories/prisma-file-record-repository.js";

export function createFileRecordRepository(prisma: PrismaClient): PrismaFileRecordRepository {
  return new PrismaFileRecordRepository(prisma);
}
