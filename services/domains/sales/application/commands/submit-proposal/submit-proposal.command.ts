/**
 * SubmitProposalCommand — Application Layer, Sales Domain.
 *
 * Traceability: [SALES_TECHNICAL_BLUEPRINT.md § 6](../../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md)
 * ("Candidate Commands" — `SubmitProposal` nomeado, sem payload definido) —
 * [SALES_SUBMIT_PROPOSAL_DESIGN.md § 4](../../../../../../knowledge/architecture/analysis/SALES_SUBMIT_PROPOSAL_DESIGN.md)
 * (Option B — `Opportunity` cria a `Proposal` internamente via
 * `submitProposal(input)`; "o Command `SubmitProposal`, quando implementado,
 * deve chamar `opportunity.submitProposal()`") —
 * [SALES_DOMAIN_COMPLETION_AUDIT.md § 14](../../../../../../knowledge/architecture/analysis/SALES_DOMAIN_COMPLETION_AUDIT.md)
 * (autoriza a abertura da Application Layer exatamente para este Command).
 * Mesmo padrão estrutural de `create-opportunity.command.ts` (`ENG-0059`) e
 * `advance-opportunity-stage.command.ts` (`ENG-0061`) — classe imutável,
 * campos primitivos, zero lógica.
 *
 * **Único campo: `opportunityId`.** `Opportunity.submitProposal(input:
 * CreateProposalInput = {})` recebe um `CreateProposalInput` que é
 * `Record<string, never>` — vazio deliberadamente, "nenhum campo de
 * conteúdo/valor está congelado" (`proposal.ts`, cabeçalho de Estado). Não há,
 * portanto, nenhum campo de conteúdo de `Proposal` para transportar hoje —
 * inventar um (preço, termos, referência a `Party`/`Quotation`) anteciparia
 * uma decisão de negócio ainda bloqueada (`SALES_AGGREGATE_DESIGN.md § 13`,
 * `SALES_DOMAIN_COMPLETION_AUDIT.md § 10`), violando restrição explícita
 * desta missão ("Caso algum campo ainda não exista oficialmente no Aggregate,
 * ele não poderá ser criado no Command").
 *
 * `opportunityId` **não é** parâmetro de `submitProposal()` em si — mesmo
 * raciocínio já registrado em `advance-opportunity-stage.command.ts`
 * (`ENG-0061`): o Command representa a intenção completa "submeter uma
 * Proposal **para qual** Opportunity", necessário para que um futuro Handler
 * localize o Aggregate via `OpportunityRepository.findById()` antes de
 * invocar `submitProposal()`.
 *
 * Tipado como `string`, não `UniqueEntityId` — mesma decisão já aplicada aos
 * dois Commands anteriores (`ENGINEERING_PLAYBOOK.md § 4`: DTOs desacoplados
 * do modelo de domínio); a conversão é responsabilidade de um futuro Handler,
 * não implementado por esta missão. Nenhuma dependência de `domain/` — nem
 * `Opportunity`, nem `Proposal`, nem `CreateProposalInput` são importados,
 * por não serem necessários para representar este contrato de entrada.
 *
 * Zero lógica, zero validação, zero conversão, zero acesso a
 * Repository/Infrastructure, zero Domain Event, zero framework — classe
 * TypeScript pura.
 *
 * Imutável: todo campo `readonly` (tempo de compilação) + `Object.freeze()`
 * (tempo de execução) — idêntico a `CreateOpportunityCommand`/`AdvanceOpportunityStageCommand`.
 */
export interface SubmitProposalCommandInput {
  readonly opportunityId: string;
}

export class SubmitProposalCommand {
  readonly opportunityId: string;

  constructor(input: SubmitProposalCommandInput) {
    this.opportunityId = input.opportunityId;
    Object.freeze(this);
  }
}
