import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Disparado por `AdvertisingAccount.connect()`. Documentado em
 * `objects/AdvertisingAccount.md § 9` e `ADR-0060`. Sem payload, mesmo
 * padrão de `OpportunityWon` (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 5`).
 */
export class AdvertisingAccountConnected implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "AdvertisingAccountConnected";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
