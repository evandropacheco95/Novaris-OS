export interface CreateReminderCommandInput {
  readonly organizationId: string;
  readonly partyId: string;
  readonly message: string;
  readonly remindAt: string;
}

export class CreateReminderCommand {
  readonly organizationId: string;
  readonly partyId: string;
  readonly message: string;
  readonly remindAt: string;

  constructor(input: CreateReminderCommandInput) {
    this.organizationId = input.organizationId;
    this.partyId = input.partyId;
    this.message = input.message;
    this.remindAt = input.remindAt;
    Object.freeze(this);
  }
}
