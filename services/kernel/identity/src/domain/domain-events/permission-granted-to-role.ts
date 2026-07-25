import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/** Disparado por `Role.grantPermission()` — proposto em IDENTITY_DOMAIN_MODEL.md § 7, IDENTITY_TECHNICAL_BLUEPRINT.md § 7. */
export class PermissionGrantedToRole implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "PermissionGrantedToRole";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
