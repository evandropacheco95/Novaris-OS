/** CreateSubscriptionCommand — Application Layer, Financial Domain. */
export interface CreateSubscriptionCommandInput {
  readonly organizationId: string;
  readonly name: string;
}

export class CreateSubscriptionCommand {
  readonly organizationId: string;
  readonly name: string;

  constructor(input: CreateSubscriptionCommandInput) {
    this.organizationId = input.organizationId;
    this.name = input.name;
    Object.freeze(this);
  }
}
