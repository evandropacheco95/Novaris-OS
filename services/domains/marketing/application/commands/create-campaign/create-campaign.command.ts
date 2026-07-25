/** CreateCampaignCommand — Application Layer, Marketing Domain. */
export interface CreateCampaignCommandInput {
  readonly organizationId: string;
  readonly name: string;
  readonly startDate?: string;
  readonly endDate?: string;
}

export class CreateCampaignCommand {
  readonly organizationId: string;
  readonly name: string;
  readonly startDate?: string;
  readonly endDate?: string;

  constructor(input: CreateCampaignCommandInput) {
    this.organizationId = input.organizationId;
    this.name = input.name;
    this.startDate = input.startDate;
    this.endDate = input.endDate;
    Object.freeze(this);
  }
}
