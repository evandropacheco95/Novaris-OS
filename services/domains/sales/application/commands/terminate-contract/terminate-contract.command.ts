export interface TerminateContractCommandInput {
  readonly contractId: string;
}

export class TerminateContractCommand {
  readonly contractId: string;

  constructor(input: TerminateContractCommandInput) {
    this.contractId = input.contractId;
    Object.freeze(this);
  }
}
