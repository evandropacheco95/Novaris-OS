/**
 * MarkOpportunityLostCommand — Application Layer, Sales Domain.
 *
 * Representa a intenção "marcar a Opportunity X como Lost" — nenhuma
 * execução, nenhum acesso ao Domain Layer. Mesmo padrão estrutural de
 * `CreateOpportunityCommand` (`ENG-0059`), `AdvanceOpportunityStageCommand`
 * (`ENG-0061`), `SubmitProposalCommand` (`ENG-0063`),
 * `ApproveProposalCommand` (`ENG-0065`) e `MarkOpportunityWonCommand`
 * (`ENG-0067`) — classe imutável, campo primitivo, zero lógica, zero import
 * (restrição explícita da Ordem de Missão `ENG-0069`: "O arquivo deve ser
 * TypeScript puro").
 *
 * `opportunityId` é o único campo — `Opportunity.markLost()` não recebe
 * nenhum parâmetro próprio (opera sobre o próprio estado da instância); o id
 * é necessário para que um futuro Handler (`ENG-0070`) localize o Aggregate
 * via `OpportunityRepository.findById()` antes de invocar `markLost()`.
 * Nenhum campo de motivo de perda, classificação, concorrente, valor perdido
 * ou usuário responsável foi incluído — `Opportunity.markLost()` não define
 * nenhum desses campos hoje, e antecipá-los inventaria uma decisão de
 * domínio ainda não tomada.
 *
 * Tipado como `string`, não `UniqueEntityId` — a conversão é responsabilidade
 * do futuro Handler.
 *
 * Imutável: campo `readonly` (tempo de compilação) + `Object.freeze()`
 * (tempo de execução) — idêntico aos cinco Commands anteriores.
 */
export interface MarkOpportunityLostCommandInput {
  readonly opportunityId: string;
}

export class MarkOpportunityLostCommand {
  readonly opportunityId: string;

  constructor(input: MarkOpportunityLostCommandInput) {
    this.opportunityId = input.opportunityId;

    Object.freeze(this);
  }
}
