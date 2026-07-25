/**
 * CreatePartyCommand — Application Layer, Customer Domain.
 *
 * Mesmo padrão estrutural de `CreateOpportunityCommand` (Sales, `ENG-0059`):
 * classe imutável, campos primitivos, zero lógica, zero import de `domain/`.
 * `organizationId`/`partyType`/`document` tipados como `string`, não
 * `UniqueEntityId`/`PartyType` — conversão é responsabilidade do Handler.
 */
export interface CreatePartyCommandInput {
  readonly organizationId: string;
  readonly partyType: string;
  readonly name: string;
  readonly document?: string;
}

export class CreatePartyCommand {
  readonly organizationId: string;
  readonly partyType: string;
  readonly name: string;
  readonly document?: string;

  constructor(input: CreatePartyCommandInput) {
    this.organizationId = input.organizationId;
    this.partyType = input.partyType;
    this.name = input.name;
    this.document = input.document;
    Object.freeze(this);
  }
}
