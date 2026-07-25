import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Disparado por `Lead.create()` (`ADR-0042`). Mesma forma mínima de
 * `OpportunityCreated` — sem payload de negócio, `eventName` usado como
 * `eventType` no Event Bus (`ADR-0037`).
 */
export class LeadCreated implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "LeadCreated";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
