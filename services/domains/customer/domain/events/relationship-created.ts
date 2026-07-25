import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Disparado por `Relationship.create()`. Confirmado em `DOMAIN_MODEL.md § EVENT BUS`
 * (`RELATIONSHIP_AGGREGATE_DESIGN.md § 7`). Segue `AGGREGATE_IMPLEMENTATION_STANDARD.md § 5`
 * (ENS-0001): nomeado `<Aggregate><AçãoNoPassado>`, sem payload de negócio
 * (mesma pendência de plataforma já registrada em `ADR-0019 § Evidence`).
 */
export class RelationshipCreated implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "RelationshipCreated";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
