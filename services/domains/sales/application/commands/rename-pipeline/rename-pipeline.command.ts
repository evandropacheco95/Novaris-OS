export interface RenamePipelineCommandInput {
  readonly pipelineId: string;
  readonly name: string;
}

export class RenamePipelineCommand {
  readonly pipelineId: string;
  readonly name: string;

  constructor(input: RenamePipelineCommandInput) {
    this.pipelineId = input.pipelineId;
    this.name = input.name;
    Object.freeze(this);
  }
}
