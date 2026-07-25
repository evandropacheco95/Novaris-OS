export interface ActivateContractCommandInput {
  readonly contractId: string;
}

export class ActivateContractCommand {
  readonly contractId: string;

  constructor(input: ActivateContractCommandInput) {
    this.contractId = input.contractId;
    Object.freeze(this);
  }
}
