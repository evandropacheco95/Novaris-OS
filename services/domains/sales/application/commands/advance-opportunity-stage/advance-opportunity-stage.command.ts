/**
 * AdvanceOpportunityStageCommand — Application Layer, Sales Domain.
 *
 * Traceability: [SALES_TECHNICAL_BLUEPRINT.md § 6](../../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md)
 * ("Candidate Commands" — `AdvanceOpportunityStage` nomeado, sem payload
 * definido) — [SALES_DOMAIN_COMPLETION_AUDIT.md § 14](../../../../../../knowledge/architecture/analysis/SALES_DOMAIN_COMPLETION_AUDIT.md)
 * (autoriza a abertura da Application Layer exatamente para este Command,
 * sobre o subconjunto já implementado/testado de `Opportunity`). Mesmo
 * padrão de [create-opportunity.command.ts](../create-opportunity/create-opportunity.command.ts)
 * (`ENG-0059`) — classe imutável, campos primitivos, zero lógica.
 *
 * `stageId` espelha o parâmetro de
 * [`Opportunity.advanceStage(stageId)`](../../../domain/aggregates/opportunity/opportunity.ts) —
 * tipado como `string`, não `UniqueEntityId` (`ENGINEERING_PLAYBOOK.md § 4`:
 * "DTOs — formato de entrada/saída da Application Layer, desacoplado do
 * modelo de domínio"); a conversão `string` → `UniqueEntityId` é
 * responsabilidade de um futuro Handler, não implementado por esta missão.
 *
 * `opportunityId` **não é** um parâmetro de `advanceStage()` em si — `Opportunity`
 * é um método de instância, não recebe seu próprio id. É incluído aqui porque
 * o Command representa a intenção completa "avançar a etapa **de qual**
 * Opportunity" — um futuro Handler precisa dele para localizar o Aggregate via
 * `OpportunityRepository.findById()` antes de chamar `advanceStage()`. Mesmo
 * padrão implícito de todo Command que age sobre um Aggregate já existente
 * (distinto de `CreateOpportunityCommand`, que não referencia nenhum id de
 * `Opportunity` porque ainda não existe uma).
 *
 * Nenhum campo de `User`/`Task`/`Activity`/`Quotation`/`Contract`/`Revenue` —
 * nenhum está implementado em `Opportunity` (`SALES_DOMAIN_COMPLETION_AUDIT.md § 10`).
 * Não valida nada, não acessa Repository/Infrastructure, não dispara Domain
 * Event, não depende de framework — classe TypeScript pura.
 *
 * Imutável: todo campo `readonly` (tempo de compilação) + `Object.freeze()`
 * (tempo de execução) — idêntico a `CreateOpportunityCommand`.
 */
export interface AdvanceOpportunityStageCommandInput {
  readonly opportunityId: string;
  readonly stageId: string;
}

export class AdvanceOpportunityStageCommand {
  readonly opportunityId: string;
  readonly stageId: string;

  constructor(input: AdvanceOpportunityStageCommandInput) {
    this.opportunityId = input.opportunityId;
    this.stageId = input.stageId;
    Object.freeze(this);
  }
}
