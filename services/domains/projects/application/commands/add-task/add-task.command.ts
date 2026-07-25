/** AddTaskCommand — Application Layer, Project Domain. */
export interface AddTaskCommandInput {
  readonly projectId: string;
  readonly title: string;
}

export class AddTaskCommand {
  readonly projectId: string;
  readonly title: string;

  constructor(input: AddTaskCommandInput) {
    this.projectId = input.projectId;
    this.title = input.title;
    Object.freeze(this);
  }
}
