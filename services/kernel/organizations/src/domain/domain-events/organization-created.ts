import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Disparado por `Organization.create()` — único Domain Event definitivo do
 * Organization Domain (ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 9): confirmado
 * simultaneamente em BOM.md, objects/Organization.md e DOMAIN_MODEL.md § EVENT BUS.
 * Nenhum outro evento é implementado — a lista completa de eventos de `Organization`
 * além deste permanece não resolvida (Freeze § 16).
 */
export class OrganizationCreated implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "OrganizationCreated";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
