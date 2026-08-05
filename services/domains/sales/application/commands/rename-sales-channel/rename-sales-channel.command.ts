export interface RenameSalesChannelCommandInput {
  readonly salesChannelId: string;
  readonly name: string;
}

export class RenameSalesChannelCommand {
  readonly salesChannelId: string;
  readonly name: string;

  constructor(input: RenameSalesChannelCommandInput) {
    this.salesChannelId = input.salesChannelId;
    this.name = input.name;
    Object.freeze(this);
  }
}
