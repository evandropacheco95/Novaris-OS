import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Case } from "../../domain/aggregates/case/case.js";
import type { CaseRepository } from "../../domain/repositories/case-repository.js";
import { PrismaCaseMapper } from "../mappers/prisma-case-mapper.js";

/** Implementação real de `CaseRepository` — Prisma Client contra Postgres. Hard delete (convenção majoritária do pacote). */
export class PrismaCaseRepository implements CaseRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Case>, InfrastructureError>> {
    try {
      const record = await this.client.case.findUnique({ where: { id: id.toString() } });
      return Result.ok(record ? Option.some(PrismaCaseMapper.toDomain(record)) : Option.none<Case>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Case "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Case[], InfrastructureError>> {
    try {
      const records = await this.client.case.findMany();
      return Result.ok(records.map((record) => PrismaCaseMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Cases", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.case.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Case "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Case): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaCaseMapper.toPersistence(entity);
      await this.client.case.upsert({
        where: { id: data.id },
        create: data,
        update: {
          subject: data.subject,
          description: data.description,
          status: data.status,
          priority: data.priority,
          updatedAt: data.updatedAt,
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Case "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.case.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Case "${id.toString()}"`, { cause: error }));
    }
  }
}
