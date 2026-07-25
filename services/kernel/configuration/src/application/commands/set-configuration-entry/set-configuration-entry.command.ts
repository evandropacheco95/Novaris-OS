export interface SetConfigurationEntryCommandInput {
  readonly organizationId: string;
  readonly key: string;
  readonly value: string;
}

export class SetConfigurationEntryCommand {
  readonly organizationId: string;
  readonly key: string;
  readonly value: string;

  constructor(input: SetConfigurationEntryCommandInput) {
    this.organizationId = input.organizationId;
    this.key = input.key;
    this.value = input.value;
    Object.freeze(this);
  }
}
