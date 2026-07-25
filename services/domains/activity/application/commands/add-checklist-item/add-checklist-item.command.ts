export interface AddChecklistItemCommandInput {
  readonly checklistId: string;
  readonly label: string;
}

export class AddChecklistItemCommand {
  readonly checklistId: string;
  readonly label: string;

  constructor(input: AddChecklistItemCommandInput) {
    this.checklistId = input.checklistId;
    this.label = input.label;
    Object.freeze(this);
  }
}
