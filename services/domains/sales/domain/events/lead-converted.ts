import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Disparado por `Lead.convert()` (`ADR-0042`) — o evento central do conceito
 * de Lead, equivalente ao `ConvertLead` do Salesforce. Mesma forma mínima de
 * `OpportunityCreated` — sem payload de negócio; quem precisar do
 * `convertedPartyId`/`convertedOpportunityId` recarrega o `Lead` via
 * Repository usando `aggregateId`, mesmo critério já usado por Audit
 * (`ADR-0035`) para não duplicar dado através de um evento fino.
 */
export class LeadConverted implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "LeadConverted";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
