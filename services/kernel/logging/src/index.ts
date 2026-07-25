// Logging Service — barrel de exportação pública.

export type { Logger, LogLevel, LogContext } from "./domain/ports/logger.js";
export { ConsoleLogger } from "./infrastructure/console-logger.js";
