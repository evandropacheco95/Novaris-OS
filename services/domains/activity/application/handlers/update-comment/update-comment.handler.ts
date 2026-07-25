import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Comment } from "../../../domain/aggregates/comment/comment.js";
import type { CommentRepository } from "../../../domain/repositories/comment-repository.js";
import type { UpdateCommentCommand } from "../../commands/update-comment/update-comment.command.js";

/** UpdateCommentHandler — Application Layer, Activity Domain (`ADR-0043`). */
export class UpdateCommentHandler {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(command: UpdateCommentCommand): Promise<Result<Comment, DomainError | InfrastructureError>> {
    const findResult = await this.commentRepository.findById(new UniqueEntityId(command.commentId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Comment "${command.commentId}" não encontrado`));
    }
    const comment = option.getOrElse(null as never);

    const updateResult = comment.updateBody(command.body);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError()!);
    }

    const saveResult = await this.commentRepository.save(comment);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(comment);
  }
}
