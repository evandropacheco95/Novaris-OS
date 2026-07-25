import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Revenue } from "../../domain/aggregates/revenue/revenue.js";
import type { RevenueRepository } from "../../domain/repositories/revenue-repository.js";
import { PrismaRevenueMapper } from "../mappers/prisma-revenue-mapper.js";

/** Implementação real de `RevenueRepository` — Prisma Client contra Postgres. Hard delete (convenção majoritária do pacote). */
export class PrismaRevenueRepository implements RevenueRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Revenue>, InfrastructureError>> {
    try {
      const record = await this.client.revenue.findUnique({ where: { id: id.toString() } });
      return Result.ok(record ? Option.some(PrismaRevenueMapper.toDomain(record)) : Option.none<Revenue>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Revenue "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Revenue[], InfrastructureError>> {
    try {
      const records = await this.client.revenue.findMany();
      return Result.ok(records.map((record) => PrismaRevenueMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Revenues", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.revenue.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Revenue "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Revenue): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaRevenueMapper.toPersistence(entity);
      await this.client.revenue.upsert({
        where: { id: data.id },
        create: data,
        update: {
          amount: data.amount,
          currency: data.currency,
          recognizedAt: data.recognizedAt,
          updatedAt: data.updatedAt,
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Revenue "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.revenue.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Revenue "${id.toString()}"`, { cause: error }));
    }
  }
}
