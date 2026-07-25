import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Disparado por `Opportunity.create()`. Confirmado em 3 fontes independentes —
 * `BOM.md § Opportunity`, `UBIQUITOUS_LANGUAGE.md § Domínio: Sales`,
 * `DOMAIN_MODEL.md § EVENT BUS` — o único evento de `Sales` com essa tripla
 * confirmação (`SALES_TECHNICAL_BLUEPRINT.md § 7`, `SALES_AGGREGATE_DESIGN.md § 10`).
 * Segue `AGGREGATE_IMPLEMENTATION_STANDARD.md § 5` (ENS-0001): nomeado
 * `<Aggregate><AçãoNoPassado>`, sem payload de negócio (pendência de plataforma
 * já registrada em `ADR-0019 § Evidence`, não específica de `Sales`).
 */
export class OpportunityCreated implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "OpportunityCreated";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
