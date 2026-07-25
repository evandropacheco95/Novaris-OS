export interface GetConfigurationEntryCommandInput {
  readonly organizationId: string;
  readonly key: string;
}

export class GetConfigurationEntryCommand {
  readonly organizationId: string;
  readonly key: string;

  constructor(input: GetConfigurationEntryCommandInput) {
    this.organizationId = input.organizationId;
    this.key = input.key;
    Object.freeze(this);
  }
}
