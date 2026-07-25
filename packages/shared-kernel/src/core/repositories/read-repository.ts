import type { AggregateRoot } from "../aggregate-roots/aggregate-root.js";
import type { UniqueEntityId } from "../entities/unique-entity-id.js";
import type { Result } from "../../types/result.js";
import type { Option } from "../../types/option.js";
import type { InfrastructureError } from "../../errors/infrastructure-error.js";
import type { Repository } from "./repository.js";

/**
 * Operações de leitura de persistência. `findById` devolve `Option` (achou/não
 * achou é resultado normal da consulta, não falha); todo método devolve
 * `Result` (falha de infraestrutura — conexão, timeout — é um caminho
 * explícito, não uma exceção lançada).
 */
export interface ReadRepository<T extends AggregateRoot<unknown>> extends Repository<T> {
  findById(id: UniqueEntityId): Promise<Result<Option<T>, InfrastructureError>>;
  findAll(): Promise<Result<T[], InfrastructureError>>;
  exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>>;
}
