/**
 * MarkOpportunityWonCommand — Application Layer, Sales Domain.
 *
 * Representa a intenção "marcar a Opportunity X como Won" — nenhuma
 * execução, nenhum acesso ao Domain Layer. Mesmo padrão estrutural de
 * `CreateOpportunityCommand` (`ENG-0059`), `AdvanceOpportunityStageCommand`
 * (`ENG-0061`), `SubmitProposalCommand` (`ENG-0063`) e
 * `ApproveProposalCommand` (`ENG-0065`) — classe imutável, campo primitivo,
 * zero lógica, zero import (restrição explícita da Ordem de Missão
 * `ENG-0067`: "O arquivo deve ser TypeScript puro").
 *
 * `opportunityId` é o único campo — `Opportunity.markWon()` não recebe
 * nenhum parâmetro próprio (opera sobre o próprio estado da instância); o id
 * é necessário para que um futuro Handler localize o Aggregate via
 * `OpportunityRepository.findById()` antes de invocar `markWon()`, mesmo
 * raciocínio já registrado nos Commands anteriores que agem sobre um
 * Aggregate já existente.
 *
 * Tipado como `string`, não `UniqueEntityId` — a conversão é responsabilidade
 * de um futuro Handler, não implementado por esta missão.
 *
 * Imutável: campo `readonly` (tempo de compilação) + `Object.freeze()`
 * (tempo de execução) — idêntico aos quatro Commands anteriores.
 */
export interface MarkOpportunityWonCommandInput {
  readonly opportunityId: string;
}

export class MarkOpportunityWonCommand {
  readonly opportunityId: string;

  constructor(input: MarkOpportunityWonCommandInput) {
    this.opportunityId = input.opportunityId;

    Object.freeze(this);
  }
}
