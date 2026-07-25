import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Disparado por `Opportunity.markWon()`. Confirmado em 3 fontes independentes —
 * `BOM.md § Opportunity`, `UBIQUITOUS_LANGUAGE.md § Domínio: Sales`,
 * `DOMAIN_MODEL.md § EVENT BUS` (`SALES_TECHNICAL_BLUEPRINT.md § 7`).
 * Segue `AGGREGATE_IMPLEMENTATION_STANDARD.md § 5` (ENS-0001) — sem payload.
 *
 * A geração de `Contract`/reconhecimento de `Revenue` a partir deste evento
 * **não é implementada aqui** — mecanismo não descrito por nenhuma fonte
 * (`SALES_AGGREGATE_DESIGN.md § 11`, `Needs Evidence`).
 */
export class OpportunityWon implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "OpportunityWon";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
