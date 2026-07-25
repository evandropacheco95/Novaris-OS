export interface SetFeatureFlagCommandInput {
  readonly organizationId: string;
  readonly key: string;
  readonly enabled: boolean;
}

export class SetFeatureFlagCommand {
  readonly organizationId: string;
  readonly key: string;
  readonly enabled: boolean;

  constructor(input: SetFeatureFlagCommandInput) {
    this.organizationId = input.organizationId;
    this.key = input.key;
    this.enabled = input.enabled;
    Object.freeze(this);
  }
}
