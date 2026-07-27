export interface AddStageCommandInput {
  readonly pipelineId: string;
  readonly name: string;
}

export class AddStageCommand {
  readonly pipelineId: string;
  readonly name: string;

  constructor(input: AddStageCommandInput) {
    this.pipelineId = input.pipelineId;
    this.name = input.name;
    Object.freeze(this);
  }
}
