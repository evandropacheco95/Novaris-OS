// Audit Service — barrel de exportação pública.
// Populado conforme cada camada de src/ ganha implementação real.

export {
  AuditEntry,
  type AuditEntryProps,
  type CreateAuditEntryInput,
} from "./domain/aggregates/audit-entry/audit-entry.js";

export type { AuditEntryRepository } from "./domain/repositories/audit-entry-repository.js";

// Application Layer
export { CreateAuditEntryCommand } from "./application/commands/create-audit-entry/create-audit-entry.command.js";
export { CreateAuditEntryHandler } from "./application/handlers/create-audit-entry/create-audit-entry.handler.js";

// Factories de Infrastructure — mantêm as classes concretas privadas ao pacote.
export { createAuditEntryRepository } from "./infrastructure/factories.js";
