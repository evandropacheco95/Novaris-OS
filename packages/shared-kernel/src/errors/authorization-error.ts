import { DomainError } from "./domain-error.js";
import type { AppErrorOptions } from "./app-error.js";

/** Ação negada por falta de permissão — código fixo `AUTHORIZATION_ERROR`. */
export class AuthorizationError extends DomainError {
  constructor(message: string, options?: AppErrorOptions) {
    super("AUTHORIZATION_ERROR", message, options);
  }
}
