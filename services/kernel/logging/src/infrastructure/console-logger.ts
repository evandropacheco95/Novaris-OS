import type { Logger, LogContext, LogLevel } from "../domain/ports/logger.js";

/**
 * Adapter real do Port `Logger` — JSON estruturado em `stdout`. Sem
 * dependência de biblioteca externa (pino/winston) — nenhum ADR escolheu uma
 * ainda (`IMPLEMENTATION_ROADMAP.md § 8`, "requer decisão"); esta
 * implementação cobre o caso real de uso (log estruturado, uma linha por
 * evento) sem antecipar uma escolha de ferramenta fora de escopo desta missão.
 */
export class ConsoleLogger implements Logger {
  debug(message: string, context?: LogContext): void {
    this.write("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.write("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.write("warn", message, context);
  }

  error(message: string, context?: LogContext): void {
    this.write("error", message, context);
  }

  private write(level: LogLevel, message: string, context?: LogContext): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context ? { context } : {}),
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  }
}
