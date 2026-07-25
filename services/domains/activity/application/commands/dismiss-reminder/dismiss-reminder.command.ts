export interface DismissReminderCommandInput {
  readonly reminderId: string;
}

export class DismissReminderCommand {
  readonly reminderId: string;

  constructor(input: DismissReminderCommandInput) {
    this.reminderId = input.reminderId;
    Object.freeze(this);
  }
}
