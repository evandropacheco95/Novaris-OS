export interface DeactivateProductCommandInput {
  readonly productId: string;
}

export class DeactivateProductCommand {
  readonly productId: string;

  constructor(input: DeactivateProductCommandInput) {
    this.productId = input.productId;
    Object.freeze(this);
  }
}
