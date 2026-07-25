export interface SendQuotationCommandInput {
  readonly quotationId: string;
}

export class SendQuotationCommand {
  readonly quotationId: string;

  constructor(input: SendQuotationCommandInput) {
    this.quotationId = input.quotationId;
    Object.freeze(this);
  }
}
