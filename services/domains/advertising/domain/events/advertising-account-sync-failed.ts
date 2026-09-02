import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Disparado por `AdvertisingAccount.failSync()`. Documentado em
 * `objects/AdvertisingAccount.md § 9` e `ADR-0060`. Sem payload — a
 * mensagem de erro vive em `SyncRun.errorMessage`, não neste evento.
 */
export class AdvertisingAccountSyncFailed implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "AdvertisingAccountSyncFailed";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
