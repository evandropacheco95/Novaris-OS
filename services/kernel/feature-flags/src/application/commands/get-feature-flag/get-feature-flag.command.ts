export interface GetFeatureFlagCommandInput {
  readonly organizationId: string;
  readonly key: string;
}

export class GetFeatureFlagCommand {
  readonly organizationId: string;
  readonly key: string;

  constructor(input: GetFeatureFlagCommandInput) {
    this.organizationId = input.organizationId;
    this.key = input.key;
    Object.freeze(this);
  }
}
