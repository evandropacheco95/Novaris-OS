import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Disparado por `Activity.complete()`. Confirmado em `BOM.md § Activity`
 * (seção `Eventos:`) e em `UBIQUITOUS_LANGUAGE.md § Domínio: Activity` —
 * achado registrado em `ACTIVITY_AGGREGATE_DESIGN.md § 6`: ausente da lista
 * de "10 eventos oficiais" de `DOMAIN_MODEL.md § EVENT BUS`, mas confirmado
 * na fonte primária do próprio objeto (mesma classe de evidência de
 * `Task.status`).
 */
export class ActivityCompleted implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "ActivityCompleted";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
