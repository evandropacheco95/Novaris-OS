export interface GenerateRevenueFromContractCommandInput {
  readonly contractId: string;
  readonly amount: number;
  readonly currency: string;
  readonly recognizedAt?: Date;
}

export class GenerateRevenueFromContractCommand {
  readonly contractId: string;
  readonly amount: number;
  readonly currency: string;
  readonly recognizedAt: Date | undefined;

  constructor(input: GenerateRevenueFromContractCommandInput) {
    this.contractId = input.contractId;
    this.amount = input.amount;
    this.currency = input.currency;
    this.recognizedAt = input.recognizedAt;
    Object.freeze(this);
  }
}
