/**
 * CreateOpportunityCommand — Application Layer, Sales Domain.
 *
 * Traceability: [SALES_TECHNICAL_BLUEPRINT.md § 6](../../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md)
 * ("Candidate Commands" — `CreateOpportunity` nomeado, sem payload definido) —
 * [SALES_IMPLEMENTATION_READINESS.md § 6](../../../../../../knowledge/architecture/analysis/SALES_IMPLEMENTATION_READINESS.md)
 * ("`CreateOpportunity` pode ser definido — Mapeia 1:1 para `Opportunity.create()`,
 * já implementado") — [SALES_DOMAIN_COMPLETION_AUDIT.md § 14](../../../../../../knowledge/architecture/analysis/SALES_DOMAIN_COMPLETION_AUDIT.md)
 * (autoriza a abertura da Application Layer exatamente para este Command, sobre
 * o subconjunto já implementado/testado de `Opportunity`).
 *
 * Campos espelham `CreateOpportunityInput` de
 * [opportunity.ts](../../../domain/aggregates/opportunity/opportunity.ts) —
 * `organizationId`, `partyId` (obrigatórios), `pipelineId`/`currentStageId`
 * (opcionais, `SALES_AGGREGATE_DESIGN.md § 8`, `Needs Evidence` se deveriam
 * ser obrigatórios). Tipados como `string`, não `UniqueEntityId` — a
 * Application Layer trabalha com dados desacoplados do modelo de domínio
 * (`ENGINEERING_PLAYBOOK.md § 4`: "DTOs — formato de entrada/saída da
 * Application Layer, desacoplado do formato HTTP e do modelo de domínio");
 * a conversão `string` → `UniqueEntityId` é responsabilidade de um Handler,
 * não implementado por esta missão (`ENG-0059`, restrição explícita).
 *
 * Nenhum campo de `User`/`Task`/`Activity`/`Quotation`/`Contract`/`Revenue` —
 * nenhum está implementado em `Opportunity` (`SALES_DOMAIN_COMPLETION_AUDIT.md § 10`),
 * incluí-los aqui inventaria um contrato que o Aggregate não suporta.
 *
 * Não valida nada (nenhuma regra de negócio, nenhuma checagem de formato) —
 * validação de DTO é uma camada própria, ainda `requer decisão/ADR`
 * (`ENGINEERING_PLAYBOOK.md § 4`, "Validators"); toda invariante de negócio
 * permanece exclusivamente em `Opportunity.create()`. Não acessa
 * `OpportunityRepository`, não acessa `infrastructure/`, não dispara Domain
 * Event, não depende de nenhum framework (`NestJS`, `class-validator` etc.) —
 * classe TypeScript pura.
 *
 * Imutável: todo campo é `readonly` (checagem em tempo de compilação) e a
 * instância é congelada em tempo de execução (`Object.freeze`) — mesma
 * disciplina de nunca expor um setter público já aplicada a todo Aggregate/Entity
 * do Domain Layer (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 1`, ENS-0001),
 * aplicada aqui a um DTO por analogia, não por exigência literal do Standard
 * (que rege Aggregates, não Commands).
 */
export interface CreateOpportunityCommandInput {
  readonly organizationId: string;
  readonly partyId: string;
  readonly pipelineId?: string;
  readonly currentStageId?: string;
}

export class CreateOpportunityCommand {
  readonly organizationId: string;
  readonly partyId: string;
  readonly pipelineId?: string;
  readonly currentStageId?: string;

  constructor(input: CreateOpportunityCommandInput) {
    this.organizationId = input.organizationId;
    this.partyId = input.partyId;
    this.pipelineId = input.pipelineId;
    this.currentStageId = input.currentStageId;
    Object.freeze(this);
  }
}
