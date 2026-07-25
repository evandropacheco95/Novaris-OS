import { AppError, type AppErrorOptions } from "./app-error.js";

/**
 * Falha não antecipada (catch-all) — filha direta de `AppError`, não de
 * `DomainError`, já que por definição não representa uma violação de regra
 * de negócio conhecida. Código fixo `UNEXPECTED_ERROR`.
 */
export class UnexpectedError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super("UNEXPECTED_ERROR", message, options);
  }
}
