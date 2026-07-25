/**
 * Port de Logging (`ENGINEERING_PLAYBOOK.md § 9` — toda Port é uma interface
 * TypeScript, nunca uma classe abstrata, mesmo padrão de `Repository`/
 * `PasswordVerifier`). Sem dependência de nenhum framework (NestJS fica no
 * adapter, em `apps/api`, nunca aqui — Ports & Adapters, `ENGINEERING_PLAYBOOK.md § 3`).
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/** Campos adicionais estruturados — nunca texto livre concatenado à mensagem. */
export interface LogContext {
  readonly [key: string]: unknown;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}
