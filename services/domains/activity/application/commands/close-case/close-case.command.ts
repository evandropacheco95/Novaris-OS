export interface CloseCaseCommandInput {
  readonly caseId: string;
}

export class CloseCaseCommand {
  readonly caseId: string;

  constructor(input: CloseCaseCommandInput) {
    this.caseId = input.caseId;
    Object.freeze(this);
  }
}
