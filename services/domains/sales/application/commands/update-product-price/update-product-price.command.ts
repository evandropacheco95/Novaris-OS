export interface UpdateProductPriceCommandInput {
  readonly productId: string;
  readonly unitPrice: number;
}

export class UpdateProductPriceCommand {
  readonly productId: string;
  readonly unitPrice: number;

  constructor(input: UpdateProductPriceCommandInput) {
    this.productId = input.productId;
    this.unitPrice = input.unitPrice;
    Object.freeze(this);
  }
}
