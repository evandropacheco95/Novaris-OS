import { AppError, type AppErrorOptions } from "./app-error.js";

/**
 * Raiz dos erros de domínio/negócio (Business Errors — ver
 * ENGINEERING_PLAYBOOK.md § 10). Abstrata: nunca lançada diretamente.
 * `InfrastructureError` e `UnexpectedError` **não** herdam daqui — o playbook
 * já separa Infrastructure Errors de Business Errors como categorias distintas.
 */
export abstract class DomainError extends AppError {
  protected constructor(code: string, message: string, options?: AppErrorOptions) {
    super(code, message, options);
  }
}
