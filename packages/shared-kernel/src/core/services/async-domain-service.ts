import type { DomainService } from "./domain-service.js";
import type { DomainServiceResult } from "./domain-service-result.js";

/**
 * Contrato base para Domain Services assíncronos. Estende `DomainService`,
 * estreitando `execute` para sempre devolver `Promise<DomainServiceResult<TOutput>>`
 * — narrowing válido, já que `Promise<X>` é um dos membros da união de retorno
 * declarada em `DomainService.execute`.
 */
export interface AsyncDomainService<TInput, TOutput> extends DomainService<TInput, TOutput> {
  execute(input: TInput): Promise<DomainServiceResult<TOutput>>;
}
