import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Comment } from "../../domain/aggregates/comment/comment.js";
import type { CommentRepository } from "../../domain/repositories/comment-repository.js";
import { PrismaCommentMapper } from "../mappers/prisma-comment-mapper.js";

/** Implementação real de `CommentRepository` — Prisma Client contra Postgres. Hard delete (única forma de remoção — sem soft delete). */
export class PrismaCommentRepository implements CommentRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Comment>, InfrastructureError>> {
    try {
      const record = await this.client.comment.findUnique({ where: { id: id.toString() } });
      return Result.ok(record ? Option.some(PrismaCommentMapper.toDomain(record)) : Option.none<Comment>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Comment "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Comment[], InfrastructureError>> {
    try {
      const records = await this.client.comment.findMany();
      return Result.ok(records.map((record) => PrismaCommentMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Comments", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.comment.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Comment "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Comment): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaCommentMapper.toPersistence(entity);
      await this.client.comment.upsert({
        where: { id: data.id },
        create: data,
        update: {
          body: data.body,
          updatedAt: data.updatedAt,
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Comment "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.comment.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Comment "${id.toString()}"`, { cause: error }));
    }
  }
}
