import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { CommentRepository } from "../../../domain/repositories/comment-repository.js";
import type { DeleteCommentCommand } from "../../commands/delete-comment/delete-comment.command.js";

/**
 * DeleteCommentHandler — Application Layer, Activity Domain (`ADR-0043`).
 * Primeira rota de hard-delete de um Aggregate completo desta plataforma
 * exposta via API (`DELETE /comments/:id`) — os 2 usos anteriores de
 * `@Delete` removem só sub-relacionamentos (Role de User, Permission de Role).
 */
export class DeleteCommentHandler {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(command: DeleteCommentCommand): Promise<Result<void, DomainError | InfrastructureError>> {
    const findResult = await this.commentRepository.findById(new UniqueEntityId(command.commentId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Comment "${command.commentId}" não encontrado`));
    }

    const deleteResult = await this.commentRepository.delete(new UniqueEntityId(command.commentId));
    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.getError()!);
    }

    return Result.ok(undefined);
  }
}
