export interface AddQuotationLineItemCommandInput {
  readonly quotationId: string;
  readonly productId: string;
  readonly quantity: number;
}

export class AddQuotationLineItemCommand {
  readonly quotationId: string;
  readonly productId: string;
  readonly quantity: number;

  constructor(input: AddQuotationLineItemCommandInput) {
    this.quotationId = input.quotationId;
    this.productId = input.productId;
    this.quantity = input.quantity;
    Object.freeze(this);
  }
}
