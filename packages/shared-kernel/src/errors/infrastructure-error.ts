import { AppError, type AppErrorOptions } from "./app-error.js";

/**
 * Falha de infraestrutura (banco fora do ar, fila indisponível — ver
 * ENGINEERING_PLAYBOOK.md § 10). Filha direta de `AppError`, **não** de
 * `DomainError` — o playbook trata Infrastructure Errors como categoria
 * distinta de Business Errors. Código fixo `INFRASTRUCTURE_ERROR`.
 */
export class InfrastructureError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super("INFRASTRUCTURE_ERROR", message, options);
  }
}
