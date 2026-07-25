import { randomUUID } from "node:crypto";
import type { DomainEvent, UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Disparado por `Opportunity.approveProposal()` — "Somente Opportunity
 * publica Domain Events" (Ordem de Missão ENG-0044); `Proposal` nunca dispara
 * evento diretamente (`Entity<T>`, sem `addDomainEvent`).
 *
 * Confirmado em 1 de 3 fontes (`UBIQUITOUS_LANGUAGE.md § Domínio: Sales`,
 * "Eventos Relacionados" de `Proposal`) — ausente de `BOM.md § Opportunity` e
 * de `DOMAIN_MODEL.md § EVENT BUS` (mesma classe de divergência menor já
 * registrada para `OpportunityLost`). Listado como aprovado em
 * `SALES_TECHNICAL_BLUEPRINT.md § 7` e citado explicitamente pela Ordem de
 * Missão `ENG-0044` ("Utilizar exclusivamente o Domain Event já existente:
 * ProposalApproved").
 *
 * **Achado registrado (Verify Before Reimplementing)**: esta classe **não
 * existia** antes desta missão — `ENG-0039` (Opportunity Aggregate Root
 * Implementation) deliberadamente não a implementou, por não haver nenhum
 * disparo real possível sem `Proposal` (então fora de escopo). A Ordem de
 * Missão `ENG-0044` presume sua existência prévia; verificado por busca
 * direta no sistema de arquivos antes de iniciar esta missão — não existia.
 * Criada agora porque é pré-requisito estrutural do único entregável
 * explicitamente pedido por esta missão (`approveProposal()` "registra
 * `ProposalApproved` como Domain Event") — sem este arquivo, esse método não
 * pode existir. Mesma forma de `OpportunityCreated`/`OpportunityWon`/`OpportunityLost`
 * (ENG-0039) — nome, payload e semântica não alterados em relação ao que já
 * era aprovado (`SALES_TECHNICAL_BLUEPRINT.md § 7`).
 *
 * `aggregateId` é o id de `Opportunity` (o Aggregate Root que a possui e a
 * publica), nunca o id da `Proposal` interna — mesma convenção já usada por
 * `OpportunityWon`/`OpportunityLost`. Sem payload de negócio — mesma pendência
 * de plataforma já registrada em `ADR-0019 § Evidence`, não específica de `Sales`.
 */
export class ProposalApproved implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "ProposalApproved";

  constructor(aggregateId: UniqueEntityId) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
