/**
 * ApproveProposalCommand — Application Layer, Sales Domain.
 *
 * Representa a intenção "solicitar aprovação da Proposal X pertencente à
 * Opportunity Y" — nenhum comportamento, nenhuma execução, nenhum acesso ao
 * Domain Layer. Mesmo padrão estrutural de `CreateOpportunityCommand`
 * (`ENG-0059`), `AdvanceOpportunityStageCommand` (`ENG-0061`) e
 * `SubmitProposalCommand` (`ENG-0063`) — classe imutável, campos primitivos,
 * zero lógica, zero import (Ordem de Missão `ENG-0065`, restrição explícita:
 * "O arquivo deve possuir ZERO imports").
 *
 * `opportunityId`/`proposalId` espelham o parâmetro de
 * `Opportunity.approveProposal(proposalId)` mais o id da própria `Opportunity`
 * — necessário para que um futuro Handler localize o Aggregate via
 * `OpportunityRepository.findById()` antes de invocar `approveProposal()`,
 * mesmo raciocínio já registrado em `advance-opportunity-stage.command.ts`
 * (`ENG-0061`) e `submit-proposal.command.ts` (`ENG-0063`).
 *
 * Tipados como `string`, não `UniqueEntityId` — a conversão é responsabilidade
 * de um futuro Handler (`ENG-0066`), não implementado por esta missão.
 *
 * Imutável: todo campo `readonly` (tempo de compilação) + `Object.freeze()`
 * (tempo de execução) — idêntico aos três Commands anteriores.
 */
export interface ApproveProposalCommandInput {
  readonly opportunityId: string;
  readonly proposalId: string;
}

export class ApproveProposalCommand {
  readonly opportunityId: string;
  readonly proposalId: string;

  constructor(input: ApproveProposalCommandInput) {
    this.opportunityId = input.opportunityId;
    this.proposalId = input.proposalId;

    Object.freeze(this);
  }
}
