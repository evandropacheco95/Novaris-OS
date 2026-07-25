import { HttpException, HttpStatus } from "@nestjs/common";
import type { DomainError } from "@novaris/shared-kernel";

/**
 * Mapeia o `code` real de `DomainError` (Shared Kernel, cada subclasse fixa o
 * seu — `NotFoundError` → `"NOT_FOUND_ERROR"`, não `"NOT_FOUND"`, achado real
 * confirmado por leitura direta de `packages/shared-kernel/src/errors/*.ts`
 * durante `ENG-0121`) para HTTP Status. Compartilhado entre todo Controller
 * desta API — extraído aqui após o mesmo mapeamento ter sido necessário uma
 * segunda vez (`AuthController`), para não divergir como `opportunity.controller.ts`
 * já divergiu uma vez.
 */
export function statusForDomainErrorCode(code: string): HttpStatus {
  switch (code) {
    case "NOT_FOUND_ERROR":
      return HttpStatus.NOT_FOUND;
    case "AUTHENTICATION_ERROR":
      return HttpStatus.UNAUTHORIZED;
    case "AUTHORIZATION_ERROR":
      return HttpStatus.FORBIDDEN;
    case "VALIDATION_ERROR":
    case "CONFLICT_ERROR":
    case "BUSINESS_RULE_ERROR":
      return HttpStatus.BAD_REQUEST;
    default:
      return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}

export function throwHttpExceptionForDomainError(error: DomainError): never {
  throw new HttpException({ code: error.code, message: error.message }, statusForDomainErrorCode(error.code));
}
