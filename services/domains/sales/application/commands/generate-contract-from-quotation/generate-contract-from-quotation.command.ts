export interface GenerateContractFromQuotationCommandInput {
  readonly quotationId: string;
}

export class GenerateContractFromQuotationCommand {
  readonly quotationId: string;

  constructor(input: GenerateContractFromQuotationCommandInput) {
    this.quotationId = input.quotationId;
    Object.freeze(this);
  }
}
