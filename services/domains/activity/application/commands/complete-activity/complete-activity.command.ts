/** CompleteActivityCommand — Application Layer, Activity Domain. */
export interface CompleteActivityCommandInput {
  readonly activityId: string;
}

export class CompleteActivityCommand {
  readonly activityId: string;

  constructor(input: CompleteActivityCommandInput) {
    this.activityId = input.activityId;
    Object.freeze(this);
  }
}
