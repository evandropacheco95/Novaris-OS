export interface AcceptQuotationCommandInput {
  readonly quotationId: string;
}

export class AcceptQuotationCommand {
  readonly quotationId: string;

  constructor(input: AcceptQuotationCommandInput) {
    this.quotationId = input.quotationId;
    Object.freeze(this);
  }
}
