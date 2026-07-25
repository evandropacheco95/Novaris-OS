import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Disparado por `Quotation.accept()` (`ADR-0043`). Mesmo par simétrico de
 * `OpportunityWon`/`OpportunityLost`. Não fecha a `Opportunity` associada
 * automaticamente — nenhuma fonte confirma esse comportamento no Salesforce
 * (ação manual separada), não inventado aqui.
 */
export class QuotationAccepted implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "QuotationAccepted";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
