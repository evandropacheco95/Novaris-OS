import type { DomainServiceResult } from "./domain-service-result.js";

/**
 * Contrato base para Domain Services — capacidades de domínio que não
 * pertencem naturalmente a uma única Entity/Aggregate ([ENGINEERING_PLAYBOOK.md
 * § 3](../../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md)).
 *
 * `execute` aceita retorno síncrono OU assíncrono (união) — isso permite que
 * `AsyncDomainService` estenda esta interface estreitando `execute` para
 * `Promise<DomainServiceResult<TOutput>>` (um subtipo válido da união), dando
 * uma relação de herança real entre as duas interfaces em vez de duas
 * interfaces irmãs desconectadas.
 */
export interface DomainService<TInput, TOutput> {
  execute(input: TInput): DomainServiceResult<TOutput> | Promise<DomainServiceResult<TOutput>>;
}
