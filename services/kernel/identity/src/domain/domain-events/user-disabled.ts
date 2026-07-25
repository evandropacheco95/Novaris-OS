import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/** Disparado por `User.disable()` — já oficial (BOM.md), IDENTITY_TECHNICAL_BLUEPRINT.md § 7. */
export class UserDisabled implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "UserDisabled";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
