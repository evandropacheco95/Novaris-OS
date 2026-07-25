import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Comment } from "../aggregates/comment/comment.js";

/** Contrato de persistência do Aggregate `Comment` (`ADR-0043`). */
export interface CommentRepository extends ReadRepository<Comment>, WriteRepository<Comment> {}
