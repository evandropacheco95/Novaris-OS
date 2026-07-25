import type { UniqueEntityId } from "../entities/unique-entity-id.js";

/**
 * Contrato oficial de Domain Event do Shared Kernel.
 *
 * Implementado como `interface`, não classe (abstrata ou não) — mesma convenção
 * já usada para Ports em ENGINEERING_PLAYBOOK.md § 9 ("toda Port é uma interface
 * TypeScript, nunca uma classe abstrata, para permitir múltiplos adapters").
 * Um Domain Event concreto (ex.: `OrganizationCreated`, definido futuramente em
 * `services/domains/<dominio>/`) só precisa satisfazer esta forma estrutural —
 * não precisa herdar de nenhuma classe do Shared Kernel nem depender de um
 * mecanismo de publicação para existir. Isso mantém `AggregateRoot` (que só
 * armazena e devolve `DomainEvent[]`) desacoplado de qualquer Event Bus,
 * Publisher ou infraestrutura de mensageria.
 */
export interface DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName: string;
}
