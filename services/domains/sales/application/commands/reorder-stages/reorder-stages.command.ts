export interface ReorderStagesCommandInput {
  readonly pipelineId: string;
  readonly orderedStageIds: string[];
}

export class ReorderStagesCommand {
  readonly pipelineId: string;
  readonly orderedStageIds: string[];

  constructor(input: ReorderStagesCommandInput) {
    this.pipelineId = input.pipelineId;
    this.orderedStageIds = input.orderedStageIds;
    Object.freeze(this);
  }
}
