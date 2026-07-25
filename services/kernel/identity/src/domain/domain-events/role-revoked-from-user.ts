import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Disparado por `User.revokeRole()`. Proposto em IDENTITY_DOMAIN_MODEL.md § 7,
 * listado em IDENTITY_TECHNICAL_BLUEPRINT.md § 7. Tecnicamente um evento do
 * Aggregate `User` — mesma nota de `RoleAssignedToUser`
 * (IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 5, 12). `aggregateId` é o `id` do `User`.
 */
export class RoleRevokedFromUser implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "RoleRevokedFromUser";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
