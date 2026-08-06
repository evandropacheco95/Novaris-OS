import { Result, ValidationError } from "@novaris/shared-kernel";

/**
 * SQL Guard (`ADR-0054`, `ENG-0170`) — validação read-only para SQL gerado
 * por um adapter de text-to-SQL, antes de qualquer execução. Regras
 * extraídas diretamente do `ia-core` real da Winnet
 * (`edge-functions/ia-core/index.ts`, prompt de sistema): "apenas 1 SELECT;
 * sem ';' múltiplos; sem INSERT/UPDATE/DELETE/DDL; nunca tabelas
 * financeiro_*, auth.* e pg_catalog".
 *
 * Diferença deliberada em relação à Winnet: lá, a segurança real vem da RLS
 * (SQL roda sob o JWT do usuário) — o prompt é só a primeira camada. No
 * NOVARIS, RLS é arquiteturalmente inerte (`rolbypassrls=true`, `ENG-0122`/
 * `ENG-0167`), então esta validação de código é a única barreira real —
 * por isso é mais estrita que o prompt da Winnet (bloqueia comentários SQL,
 * que poderiam ocultar um segundo statement de um parser ingênuo).
 *
 * Allowlist de tabelas — mesmo critério de exclusão da Winnet
 * (financeiro_* e auth.*), mapeado para os domínios reais do NOVARIS: exclui
 * Identity/Workspace (`users`, `roles`, `credentials`, `organizations`) e
 * Financial (`invoices`, `subscriptions`), além de tabelas de configuração
 * de sistema (`audit_entries`, `configuration_entries`, `feature_flags`,
 * `automation_rules`). Todo o resto (CRM/Sales/Marketing/Analytics) é dado
 * de negócio elegível para consulta.
 */
export const TEXT_TO_SQL_ALLOWED_TABLES = [
  "opportunities",
  "sales_channels",
  "pipelines",
  "stages",
  "proposals",
  "parties",
  "relationships",
  "projects",
  "tasks",
  "activities",
  "campaigns",
  "campaign_assets",
  "dashboards",
  "widgets",
  "file_records",
  "leads",
  "products",
  "quotations",
  "quotation_line_items",
  "cases",
  "comments",
  "contracts",
  "revenues",
  "calendar_events",
  "reminders",
  "checklists",
  "checklist_items",
] as const;

const FORBIDDEN_KEYWORDS = [
  "insert",
  "update",
  "delete",
  "drop",
  "alter",
  "truncate",
  "grant",
  "revoke",
  "create",
  "comment",
  "call",
  "execute",
  "merge",
  "copy",
  "vacuum",
  "reindex",
  "set",
  "reset",
  "lock",
  "begin",
  "commit",
  "rollback",
  "into",
];

const TABLE_REFERENCE_PATTERN = /\b(?:from|join)\s+"?(\w+)"?/gi;

/** Valida que `sql` é um único `SELECT` read-only, sem comentários, restrito à allowlist de tabelas. */
export function validateReadOnlySql(sql: string): Result<void, ValidationError> {
  const trimmed = sql.trim();
  if (trimmed.length === 0) {
    return Result.fail(new ValidationError('"sql" não pode ser vazio'));
  }
  if (trimmed.includes("--") || trimmed.includes("/*")) {
    return Result.fail(new ValidationError("SQL não pode conter comentários"));
  }

  const statements = trimmed
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
  if (statements.length !== 1) {
    return Result.fail(new ValidationError("SQL deve conter exatamente 1 statement"));
  }
  const statement = statements[0]!;

  if (!/^select\b/i.test(statement)) {
    return Result.fail(new ValidationError('SQL deve começar com "SELECT"'));
  }

  for (const keyword of FORBIDDEN_KEYWORDS) {
    if (new RegExp(`\\b${keyword}\\b`, "i").test(statement)) {
      return Result.fail(new ValidationError(`SQL não pode conter a palavra-chave "${keyword.toUpperCase()}"`));
    }
  }

  const referencedTables = [...statement.matchAll(TABLE_REFERENCE_PATTERN)].map((match) => match[1]!.toLowerCase());
  for (const table of referencedTables) {
    if (!(TEXT_TO_SQL_ALLOWED_TABLES as readonly string[]).includes(table)) {
      return Result.fail(new ValidationError(`Tabela "${table}" não está na allowlist de text-to-SQL`));
    }
  }

  return Result.ok(undefined);
}
