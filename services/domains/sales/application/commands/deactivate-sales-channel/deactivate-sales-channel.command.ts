export interface DeactivateSalesChannelCommandInput {
  readonly salesChannelId: string;
}

export class DeactivateSalesChannelCommand {
  readonly salesChannelId: string;

  constructor(input: DeactivateSalesChannelCommandInput) {
    this.salesChannelId = input.salesChannelId;
    Object.freeze(this);
  }
}
