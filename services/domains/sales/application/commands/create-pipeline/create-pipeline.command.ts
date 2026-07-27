export interface CreatePipelineCommandInput {
  readonly organizationId: string;
  readonly name: string;
}

export class CreatePipelineCommand {
  readonly organizationId: string;
  readonly name: string;

  constructor(input: CreatePipelineCommandInput) {
    this.organizationId = input.organizationId;
    this.name = input.name;
    Object.freeze(this);
  }
}
