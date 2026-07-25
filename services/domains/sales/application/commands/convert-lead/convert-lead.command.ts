export interface ConvertLeadCommandInput {
  readonly leadId: string;
  readonly partyType: string;
  readonly createOpportunity?: boolean;
  readonly pipelineId?: string;
  readonly currentStageId?: string;
}

export class ConvertLeadCommand {
  readonly leadId: string;
  readonly partyType: string;
  readonly createOpportunity: boolean;
  readonly pipelineId?: string;
  readonly currentStageId?: string;

  constructor(input: ConvertLeadCommandInput) {
    this.leadId = input.leadId;
    this.partyType = input.partyType;
    this.createOpportunity = input.createOpportunity ?? false;
    this.pipelineId = input.pipelineId;
    this.currentStageId = input.currentStageId;
    Object.freeze(this);
  }
}
