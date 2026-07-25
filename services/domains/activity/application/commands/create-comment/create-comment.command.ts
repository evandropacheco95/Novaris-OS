export interface CreateCommentCommandInput {
  readonly organizationId: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly authorUserId: string;
  readonly body: string;
}

export class CreateCommentCommand {
  readonly organizationId: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly authorUserId: string;
  readonly body: string;

  constructor(input: CreateCommentCommandInput) {
    this.organizationId = input.organizationId;
    this.targetType = input.targetType;
    this.targetId = input.targetId;
    this.authorUserId = input.authorUserId;
    this.body = input.body;
    Object.freeze(this);
  }
}
