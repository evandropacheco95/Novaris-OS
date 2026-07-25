export interface CreateProductCommandInput {
  readonly organizationId: string;
  readonly name: string;
  readonly sku?: string;
  readonly unitPrice: number;
}

export class CreateProductCommand {
  readonly organizationId: string;
  readonly name: string;
  readonly sku?: string;
  readonly unitPrice: number;

  constructor(input: CreateProductCommandInput) {
    this.organizationId = input.organizationId;
    this.name = input.name;
    this.sku = input.sku;
    this.unitPrice = input.unitPrice;
    Object.freeze(this);
  }
}
