export interface StartCaseCommandInput {
  readonly caseId: string;
}

export class StartCaseCommand {
  readonly caseId: string;

  constructor(input: StartCaseCommandInput) {
    this.caseId = input.caseId;
    Object.freeze(this);
  }
}
