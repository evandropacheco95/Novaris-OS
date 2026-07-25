import type { Result } from "../../types/result.js";
import type { DomainError } from "../../errors/domain-error.js";
import type { InfrastructureError } from "../../errors/infrastructure-error.js";

/**
 * Resultado padrão de um Domain Service — reaproveita `Result<T, E>`
 * (Missão ENG-0001.3) em vez de reimplementar sucesso/falha. O canal de erro
 * é a união `DomainError | InfrastructureError`: um Domain Service pode falhar
 * por violação de regra de negócio (`DomainError`, ENG-0001.4) ou por falha de
 * uma dependência de infraestrutura acessada via port (`InfrastructureError`).
 */
export type DomainServiceResult<T> = Result<T, DomainError | InfrastructureError>;
