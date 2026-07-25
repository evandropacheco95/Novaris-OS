/** MarkInvoicePaidCommand — Application Layer, Financial Domain. */
export interface MarkInvoicePaidCommandInput {
  readonly invoiceId: string;
}

export class MarkInvoicePaidCommand {
  readonly invoiceId: string;

  constructor(input: MarkInvoicePaidCommandInput) {
    this.invoiceId = input.invoiceId;
    Object.freeze(this);
  }
}
