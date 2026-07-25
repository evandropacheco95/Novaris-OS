import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import { PrismaClient, Prisma } from "@prisma/client";

/**
 * Carrega `packages/database/.env` por caminho absoluto (derivado da própria
 * localização deste módulo, nunca do `cwd` do processo que o importa) — sem
 * isso, um Repository chamado a partir de `services/domains/sales` (cwd
 * diferente) não encontraria o `.env` que só existe em `packages/database/`.
 * `process.loadEnvFile` é nativo do Node 20+ (`engines` do monorepo já exige
 * `>=20`), sem dependência adicional (`dotenv`).
 */
const envPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".env");
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

/**
 * Client Prisma compartilhado — instância única reutilizada por todo
 * Repository de Infrastructure Layer que precise de persistência real.
 *
 * Não gerencia RLS (`ADR-0005`) — políticas de Row Level Security vivem nas
 * migrations SQL (`prisma/migrations/`), nunca neste client.
 */
export const prisma = new PrismaClient();

/**
 * Namespace `Prisma` (não só tipos) — primeiro consumidor real é
 * `PrismaAuditEntryMapper` (`changeSet: Json?`), que precisa do sentinel
 * `Prisma.JsonNull` em runtime (um `null` bruto não é aceito pelo tipo
 * gerado `NullableJsonNullValueInput` para campo Json anulável).
 */
export { Prisma };

export type {
  PrismaClient,
  Opportunity,
  Pipeline,
  Stage,
  Proposal,
  Organization,
  User,
  Role,
  Credential,
  Party,
  Relationship,
  Project,
  Task,
  Invoice,
  Subscription,
  Activity,
  Campaign,
  Dashboard,
  AuditEntry,
  ConfigurationEntry,
  FeatureFlag,
  FileRecord,
  AutomationRule,
  Lead,
  Product,
  Quotation,
  QuotationLineItem,
  Case,
  Comment,
  Contract,
  CalendarEvent,
  Reminder,
  Checklist,
  ChecklistItem,
} from "@prisma/client";
