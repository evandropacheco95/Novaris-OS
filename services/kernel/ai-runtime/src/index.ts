// AI Runtime Service — barrel de exportação pública (`ADR-0041`).

export type { AIRuntime, AIContext, AIResponse } from "./domain/ports/ai-runtime.js";
export { ConsoleAIRuntime } from "./infrastructure/console-ai-runtime.js";

export type { TextToSqlPort, TextToSqlContext, TextToSqlResult } from "./domain/ports/text-to-sql.js";
export { validateReadOnlySql, TEXT_TO_SQL_ALLOWED_TABLES } from "./domain/services/sql-guard.js";
export { ConsoleTextToSqlRuntime } from "./infrastructure/console-text-to-sql.js";
