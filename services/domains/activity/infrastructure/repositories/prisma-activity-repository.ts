import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Activity } from "../../domain/aggregates/activity/activity.js";
import type { ActivityRepository } from "../../domain/repositories/activity-repository.js";
import { PrismaActivityMapper } from "../mappers/prisma-activity-mapper.js";

/** Implementação real de `ActivityRepository` — persistência via Prisma Client contra Postgres (Supabase). */
export class PrismaActivityRepository implements ActivityRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Activity>, InfrastructureError>> {
    try {
      const record = await this.client.activity.findUnique({ where: { id: id.toString() } });
      if (!record) {
        return Result.ok(Option.none<Activity>());
      }
      return Result.ok(Option.some(PrismaActivityMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Activity "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Activity[], InfrastructureError>> {
    try {
      const records = await this.client.activity.findMany();
      return Result.ok(records.map((record) => PrismaActivityMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Activities", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.activity.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Activity "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Activity): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaActivityMapper.toPersistenceCreate(entity);
      await this.client.activity.upsert({
        where: { id: data.id },
        create: data,
        update: { status: data.status, notes: data.notes },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Activity "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.activity.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Activity "${id.toString()}"`, { cause: error }));
    }
  }
}
