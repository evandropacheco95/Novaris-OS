/** CreateInvoiceCommand — Application Layer, Financial Domain. */
export interface CreateInvoiceCommandInput {
  readonly organizationId: string;
  readonly amount: number;
  readonly currency: string;
  readonly subscriptionId?: string;
}

export class CreateInvoiceCommand {
  readonly organizationId: string;
  readonly amount: number;
  readonly currency: string;
  readonly subscriptionId?: string;

  constructor(input: CreateInvoiceCommandInput) {
    this.organizationId = input.organizationId;
    this.amount = input.amount;
    this.currency = input.currency;
    this.subscriptionId = input.subscriptionId;
    Object.freeze(this);
  }
}
