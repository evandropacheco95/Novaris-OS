/** SyncAdvertisingAccountCommand — Application Layer, Advertising Domain. */
export interface SyncAdvertisingAccountCommandInput {
  readonly organizationId: string;
  readonly advertisingAccountId: string;
}

export class SyncAdvertisingAccountCommand {
  readonly organizationId: string;
  readonly advertisingAccountId: string;

  constructor(input: SyncAdvertisingAccountCommandInput) {
    this.organizationId = input.organizationId;
    this.advertisingAccountId = input.advertisingAccountId;
    Object.freeze(this);
  }
}
