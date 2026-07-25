import { DomainError } from "./domain-error.js";
import type { AppErrorOptions } from "./app-error.js";

/** Identidade não estabelecida ou inválida — código fixo `AUTHENTICATION_ERROR`. */
export class AuthenticationError extends DomainError {
  constructor(message: string, options?: AppErrorOptions) {
    super("AUTHENTICATION_ERROR", message, options);
  }
}
