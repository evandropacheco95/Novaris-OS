import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/** Disparado por `Contract.activate()` (`ADR-0044`). */
export class ContractActivated implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "ContractActivated";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
