export interface DeleteCommentCommandInput {
  readonly commentId: string;
}

export class DeleteCommentCommand {
  readonly commentId: string;

  constructor(input: DeleteCommentCommandInput) {
    this.commentId = input.commentId;
    Object.freeze(this);
  }
}
