export interface CreateQuotationCommandInput {
  readonly organizationId: string;
  readonly opportunityId: string;
}

export class CreateQuotationCommand {
  readonly organizationId: string;
  readonly opportunityId: string;

  constructor(input: CreateQuotationCommandInput) {
    this.organizationId = input.organizationId;
    this.opportunityId = input.opportunityId;
    Object.freeze(this);
  }
}
