import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Comment } from "../../../domain/aggregates/comment/comment.js";
import type { CommentRepository } from "../../../domain/repositories/comment-repository.js";
import type { CreateCommentCommand } from "../../commands/create-comment/create-comment.command.js";

/** CreateCommentHandler — Application Layer, Activity Domain (`ADR-0043`). */
export class CreateCommentHandler {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(command: CreateCommentCommand): Promise<Result<Comment, DomainError | InfrastructureError>> {
    const createResult = Comment.create({
      organizationId: new UniqueEntityId(command.organizationId),
      targetType: command.targetType,
      targetId: new UniqueEntityId(command.targetId),
      authorUserId: new UniqueEntityId(command.authorUserId),
      body: command.body,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const comment = createResult.getValue()!;

    const saveResult = await this.commentRepository.save(comment);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(comment);
  }
}
