import { DomainError } from "./domain-error.js";
import type { AppErrorOptions } from "./app-error.js";

/** Estado conflitante (ex.: recurso já existe) — código fixo `CONFLICT_ERROR`. */
export class ConflictError extends DomainError {
  constructor(message: string, options?: AppErrorOptions) {
    super("CONFLICT_ERROR", message, options);
  }
}
