/**
 * CreateRelationshipCommand — Application Layer, Customer Domain.
 *
 * Mesmo padrão estrutural de `CreatePartyCommand`/`CreateOpportunityCommand`
 * — classe imutável, campos primitivos, zero lógica.
 */
export interface CreateRelationshipCommandInput {
  readonly organizationId: string;
  readonly partyIdA: string;
  readonly partyIdB: string;
  readonly type: string;
}

export class CreateRelationshipCommand {
  readonly organizationId: string;
  readonly partyIdA: string;
  readonly partyIdB: string;
  readonly type: string;

  constructor(input: CreateRelationshipCommandInput) {
    this.organizationId = input.organizationId;
    this.partyIdA = input.partyIdA;
    this.partyIdB = input.partyIdB;
    this.type = input.type;
    Object.freeze(this);
  }
}
