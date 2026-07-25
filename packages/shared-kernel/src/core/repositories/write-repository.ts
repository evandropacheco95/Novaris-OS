import type { AggregateRoot } from "../aggregate-roots/aggregate-root.js";
import type { UniqueEntityId } from "../entities/unique-entity-id.js";
import type { Result } from "../../types/result.js";
import type { InfrastructureError } from "../../errors/infrastructure-error.js";
import type { Repository } from "./repository.js";

/**
 * Operações de escrita de persistência. Validação de regra de negócio
 * acontece antes de chamar `save` (Domain/Application Layer) — o `Result`
 * aqui representa apenas sucesso/falha de infraestrutura.
 */
export interface WriteRepository<T extends AggregateRoot<unknown>> extends Repository<T> {
  save(entity: T): Promise<Result<void, InfrastructureError>>;
  delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>>;
}
