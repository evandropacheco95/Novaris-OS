/** UpdateTaskStatusCommand — Application Layer, Project Domain. */
export interface UpdateTaskStatusCommandInput {
  readonly projectId: string;
  readonly taskId: string;
  readonly status: string;
}

export class UpdateTaskStatusCommand {
  readonly projectId: string;
  readonly taskId: string;
  readonly status: string;

  constructor(input: UpdateTaskStatusCommandInput) {
    this.projectId = input.projectId;
    this.taskId = input.taskId;
    this.status = input.status;
    Object.freeze(this);
  }
}
