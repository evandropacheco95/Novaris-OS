export interface RenameStageCommandInput {
  readonly pipelineId: string;
  readonly stageId: string;
  readonly name: string;
}

export class RenameStageCommand {
  readonly pipelineId: string;
  readonly stageId: string;
  readonly name: string;

  constructor(input: RenameStageCommandInput) {
    this.pipelineId = input.pipelineId;
    this.stageId = input.stageId;
    this.name = input.name;
    Object.freeze(this);
  }
}
