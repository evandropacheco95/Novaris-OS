import { DomainError } from "./domain-error.js";
import type { AppErrorOptions } from "./app-error.js";

/** Violação de invariante de entrada/dado — código fixo `VALIDATION_ERROR`. */
export class ValidationError extends DomainError {
  constructor(message: string, options?: AppErrorOptions) {
    super("VALIDATION_ERROR", message, options);
  }
}
