export interface RejectQuotationCommandInput {
  readonly quotationId: string;
}

export class RejectQuotationCommand {
  readonly quotationId: string;

  constructor(input: RejectQuotationCommandInput) {
    this.quotationId = input.quotationId;
    Object.freeze(this);
  }
}
