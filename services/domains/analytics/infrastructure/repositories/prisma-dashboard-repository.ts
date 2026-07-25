import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Dashboard } from "../../domain/aggregates/dashboard/dashboard.js";
import type { DashboardRepository } from "../../domain/repositories/dashboard-repository.js";
import { PrismaDashboardMapper } from "../mappers/prisma-dashboard-mapper.js";

/** Implementação real de `DashboardRepository` — persistência via Prisma Client contra Postgres (Supabase). */
export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Dashboard>, InfrastructureError>> {
    try {
      const record = await this.client.dashboard.findUnique({ where: { id: id.toString() } });
      if (!record) {
        return Result.ok(Option.none<Dashboard>());
      }
      return Result.ok(Option.some(PrismaDashboardMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Dashboard "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Dashboard[], InfrastructureError>> {
    try {
      const records = await this.client.dashboard.findMany();
      return Result.ok(records.map((record) => PrismaDashboardMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Dashboards", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.dashboard.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Dashboard "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Dashboard): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaDashboardMapper.toPersistenceCreate(entity);
      await this.client.dashboard.upsert({
        where: { id: data.id },
        create: data,
        update: { name: data.name },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Dashboard "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.dashboard.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Dashboard "${id.toString()}"`, { cause: error }));
    }
  }
}
