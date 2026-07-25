import type { PrismaClient } from "@novaris/database";
import type { AuditEntryRepository } from "../domain/repositories/audit-entry-repository.js";
import { PrismaAuditEntryRepository } from "./repositories/prisma-audit-entry-repository.js";

/** Factories de Infrastructure — mantêm as classes concretas privadas ao pacote. */
export function createAuditEntryRepository(client: PrismaClient): AuditEntryRepository {
  return new PrismaAuditEntryRepository(client);
}
