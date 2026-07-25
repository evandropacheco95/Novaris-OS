import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Disparado por `Invoice.markPaid()`. Confirmado em `DOMAIN_MODEL.md § EVENT BUS`
 * (um dos 10 eventos oficiais da plataforma) e em `UBIQUITOUS_LANGUAGE.md § Domínio: Financial`
 * ("Eventos Relacionados: InvoicePaid"). Segue `AGGREGATE_IMPLEMENTATION_STANDARD.md § 5`
 * (ENS-0001): nomeado `<Aggregate><AçãoNoPassado>`, sem payload de negócio
 * (mesma pendência de plataforma já registrada em `ADR-0019 § Evidence`).
 */
export class InvoicePaid implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "InvoicePaid";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
