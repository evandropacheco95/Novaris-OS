import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Comment as PrismaComment } from "@novaris/database";
import { Comment, type CommentProps } from "../../domain/aggregates/comment/comment.js";

/** PrismaCommentMapper — tradução direta Aggregate ↔ Prisma, mesmo padrão de `PrismaLeadMapper`. */
export class PrismaCommentMapper {
  static toDomain(record: PrismaComment): Comment {
    const props: CommentProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      targetType: record.targetType,
      targetId: new UniqueEntityId(record.targetId),
      authorUserId: new UniqueEntityId(record.authorUserId),
      body: record.body,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return Comment.reconstitute(props, new UniqueEntityId(record.id));
  }

  static toPersistence(comment: Comment): PrismaComment {
    return {
      id: comment.id.toString(),
      organizationId: comment.organizationId.toString(),
      targetType: comment.targetType,
      targetId: comment.targetId.toString(),
      authorUserId: comment.authorUserId.toString(),
      body: comment.body,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
