export interface ActivateProductCommandInput {
  readonly productId: string;
}

export class ActivateProductCommand {
  readonly productId: string;

  constructor(input: ActivateProductCommandInput) {
    this.productId = input.productId;
    Object.freeze(this);
  }
}
