import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Disparado por `Opportunity.markLost()`. Confirmado em 2 de 3 fontes —
 * `BOM.md § Opportunity`, `UBIQUITOUS_LANGUAGE.md § Domínio: Sales` —
 * **ausente** de `DOMAIN_MODEL.md § EVENT BUS` (divergência menor já registrada
 * por `CRM_DOMAIN_DISCOVERY.md § 2` e reafirmada em `SALES_TECHNICAL_BLUEPRINT.md § 7`).
 * Implementado mesmo assim porque a Ordem de Missão `ENG-0039` o lista
 * explicitamente entre os eventos já aprovados. Segue
 * `AGGREGATE_IMPLEMENTATION_STANDARD.md § 5` (ENS-0001) — sem payload.
 */
export class OpportunityLost implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "OpportunityLost";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
