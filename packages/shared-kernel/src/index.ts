// Shared Kernel — barrel de exportação pública.
// Populado conforme cada bloco de src/core/ e src/ ganha implementação real.

export { UniqueEntityId } from "./core/entities/unique-entity-id.js";
export { Entity } from "./core/entities/entity.js";
export { ValueObject } from "./core/value-objects/value-object.js";
export { AggregateRoot } from "./core/aggregate-roots/aggregate-root.js";
export type { DomainEvent } from "./core/domain-events/domain-event.js";

// Primitivas funcionais (Missão ENG-0001.3)
export { Result } from "./types/result.js";
export { Either } from "./types/either.js";
export { Option } from "./types/option.js";

// Sistema de erros de domínio (Missão ENG-0001.4)
export { AppError, type AppErrorOptions } from "./errors/app-error.js";
export { DomainError } from "./errors/domain-error.js";
export { ValidationError } from "./errors/validation-error.js";
export { BusinessRuleError } from "./errors/business-rule-error.js";
export { AuthorizationError } from "./errors/authorization-error.js";
export { AuthenticationError } from "./errors/authentication-error.js";
export { ConflictError } from "./errors/conflict-error.js";
export { NotFoundError } from "./errors/not-found-error.js";
export { InfrastructureError } from "./errors/infrastructure-error.js";
export { UnexpectedError } from "./errors/unexpected-error.js";

// Specification Pattern (Missão ENG-0001.6)
export type { Specification } from "./core/specifications/specification.js";
export { AbstractSpecification } from "./core/specifications/abstract-specification.js";
export { AndSpecification } from "./core/specifications/and-specification.js";
export { OrSpecification } from "./core/specifications/or-specification.js";
export { NotSpecification } from "./core/specifications/not-specification.js";

// Contratos de repositório (Missão ENG-0001.7)
export type { Repository } from "./core/repositories/repository.js";
export type { ReadRepository } from "./core/repositories/read-repository.js";
export type { WriteRepository } from "./core/repositories/write-repository.js";

// Contratos de Domain Service (Missão ENG-0001.8)
export type { DomainServiceResult } from "./core/services/domain-service-result.js";
export type { DomainService } from "./core/services/domain-service.js";
export type { AsyncDomainService } from "./core/services/async-domain-service.js";

// Contratos estruturais compartilhados (Missão ENG-0001.9)
export type { HasIdentity } from "./interfaces/has-identity.js";
export type { Timestamped } from "./interfaces/timestamped.js";
export type { Versionable } from "./interfaces/versionable.js";
export type { HasMetadata } from "./interfaces/has-metadata.js";
export type { Auditable } from "./interfaces/auditable.js";
