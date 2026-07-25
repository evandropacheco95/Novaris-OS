export interface AddAssetToCampaignCommandInput {
  readonly campaignId: string;
  readonly fileRecordId: string;
}

export class AddAssetToCampaignCommand {
  readonly campaignId: string;
  readonly fileRecordId: string;

  constructor(input: AddAssetToCampaignCommandInput) {
    this.campaignId = input.campaignId;
    this.fileRecordId = input.fileRecordId;
    Object.freeze(this);
  }
}
