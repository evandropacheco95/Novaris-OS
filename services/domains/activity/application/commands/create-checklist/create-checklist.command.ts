export interface CreateChecklistCommandInput {
  readonly organizationId: string;
  readonly partyId: string;
  readonly title: string;
}

export class CreateChecklistCommand {
  readonly organizationId: string;
  readonly partyId: string;
  readonly title: string;

  constructor(input: CreateChecklistCommandInput) {
    this.organizationId = input.organizationId;
    this.partyId = input.partyId;
    this.title = input.title;
    Object.freeze(this);
  }
}
