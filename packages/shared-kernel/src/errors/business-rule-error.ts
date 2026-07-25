import { DomainError } from "./domain-error.js";
import type { AppErrorOptions } from "./app-error.js";

/** Violação de uma Specification/Policy de domínio — código fixo `BUSINESS_RULE_ERROR`. */
export class BusinessRuleError extends DomainError {
  constructor(message: string, options?: AppErrorOptions) {
    super("BUSINESS_RULE_ERROR", message, options);
  }
}
