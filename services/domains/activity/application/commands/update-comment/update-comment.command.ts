export interface UpdateCommentCommandInput {
  readonly commentId: string;
  readonly body: string;
}

export class UpdateCommentCommand {
  readonly commentId: string;
  readonly body: string;

  constructor(input: UpdateCommentCommandInput) {
    this.commentId = input.commentId;
    this.body = input.body;
    Object.freeze(this);
  }
}
