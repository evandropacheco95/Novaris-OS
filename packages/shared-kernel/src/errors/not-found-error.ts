import { DomainError } from "./domain-error.js";
import type { AppErrorOptions } from "./app-error.js";

/** Entidade/Aggregate não encontrado — código fixo `NOT_FOUND_ERROR`. */
export class NotFoundError extends DomainError {
  constructor(message: string, options?: AppErrorOptions) {
    super("NOT_FOUND_ERROR", message, options);
  }
}
