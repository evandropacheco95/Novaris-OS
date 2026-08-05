export interface ActivateSalesChannelCommandInput {
  readonly salesChannelId: string;
}

export class ActivateSalesChannelCommand {
  readonly salesChannelId: string;

  constructor(input: ActivateSalesChannelCommandInput) {
    this.salesChannelId = input.salesChannelId;
    Object.freeze(this);
  }
}
