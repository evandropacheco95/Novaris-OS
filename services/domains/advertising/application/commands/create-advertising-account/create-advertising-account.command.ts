import type { AdvertisingProvider } from "../../../domain/aggregates/advertising-account/advertising-account.js";

/** CreateAdvertisingAccountCommand — Application Layer, Advertising Domain. */
export interface CreateAdvertisingAccountCommandInput {
  readonly organizationId: string;
  readonly provider: AdvertisingProvider;
  readonly name: string;
}

export class CreateAdvertisingAccountCommand {
  readonly organizationId: string;
  readonly provider: AdvertisingProvider;
  readonly name: string;

  constructor(input: CreateAdvertisingAccountCommandInput) {
    this.organizationId = input.organizationId;
    this.provider = input.provider;
    this.name = input.name;
    Object.freeze(this);
  }
}
