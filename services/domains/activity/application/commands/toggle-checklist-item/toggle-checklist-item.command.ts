export interface ToggleChecklistItemCommandInput {
  readonly checklistId: string;
  readonly itemId: string;
}

export class ToggleChecklistItemCommand {
  readonly checklistId: string;
  readonly itemId: string;

  constructor(input: ToggleChecklistItemCommandInput) {
    this.checklistId = input.checklistId;
    this.itemId = input.itemId;
    Object.freeze(this);
  }
}
