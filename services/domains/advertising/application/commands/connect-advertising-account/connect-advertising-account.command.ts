/** ConnectAdvertisingAccountCommand — Application Layer, Advertising Domain. */
export interface ConnectAdvertisingAccountCommandInput {
  readonly organizationId: string;
  readonly advertisingAccountId: string;
  readonly actorId: string;
  readonly externalAccountId: string;
  readonly authorizationCode: string;
  readonly redirectUri: string;
}

export class ConnectAdvertisingAccountCommand {
  readonly organizationId: string;
  readonly advertisingAccountId: string;
  readonly actorId: string;
  readonly externalAccountId: string;
  readonly authorizationCode: string;
  readonly redirectUri: string;

  constructor(input: ConnectAdvertisingAccountCommandInput) {
    this.organizationId = input.organizationId;
    this.advertisingAccountId = input.advertisingAccountId;
    this.actorId = input.actorId;
    this.externalAccountId = input.externalAccountId;
    this.authorizationCode = input.authorizationCode;
    this.redirectUri = input.redirectUri;
    Object.freeze(this);
  }
}
