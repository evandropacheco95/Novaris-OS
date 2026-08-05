import type { SalesChannelType } from "../../../domain/aggregates/sales-channel/sales-channel.js";

export interface CreateSalesChannelCommandInput {
  readonly organizationId: string;
  readonly name: string;
  readonly type: SalesChannelType;
}

export class CreateSalesChannelCommand {
  readonly organizationId: string;
  readonly name: string;
  readonly type: SalesChannelType;

  constructor(input: CreateSalesChannelCommandInput) {
    this.organizationId = input.organizationId;
    this.name = input.name;
    this.type = input.type;
    Object.freeze(this);
  }
}
