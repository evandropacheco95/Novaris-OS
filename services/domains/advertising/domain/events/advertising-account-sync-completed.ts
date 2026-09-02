import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Disparado por `AdvertisingAccount.completeSync()`. Documentado em
 * `objects/AdvertisingAccount.md § 9` e `ADR-0060`. Sem payload — os
 * contadores de sincronização vivem em `SyncRun`, não neste evento.
 */
export class AdvertisingAccountSyncCompleted implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "AdvertisingAccountSyncCompleted";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
