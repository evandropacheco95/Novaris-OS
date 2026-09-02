import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { SyncRun } from "../../domain/aggregates/sync-run/sync-run.js";
import type { SyncRunRepository } from "../../domain/repositories/sync-run-repository.js";
import { PrismaSyncRunMapper } from "../mappers/prisma-sync-run-mapper.js";

/** Implementação real de `SyncRunRepository` — persistência via Prisma Client. `save()` faz upsert por `id` para permitir `complete()`/`fail()` no mesmo registro após o `INSERT` inicial. */
export class PrismaSyncRunRepository implements SyncRunRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<SyncRun>, InfrastructureError>> {
    try {
      const record = await this.client.syncRun.findUnique({ where: { id: id.toString() } });
      if (!record) {
        return Result.ok(Option.none<SyncRun>());
      }
      return Result.ok(Option.some(PrismaSyncRunMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar SyncRun "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<SyncRun[], InfrastructureError>> {
    try {
      const records = await this.client.syncRun.findMany();
      return Result.ok(records.map((record) => PrismaSyncRunMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar SyncRuns", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.syncRun.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de SyncRun "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: SyncRun): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaSyncRunMapper.toPersistenceCreate(entity);
      await this.client.syncRun.upsert({
        where: { id: data.id },
        create: data,
        update: {
          status: data.status,
          finishedAt: data.finishedAt,
          errorMessage: data.errorMessage,
          campaignsSynced: data.campaignsSynced,
          adGroupsSynced: data.adGroupsSynced,
          keywordsSynced: data.keywordsSynced,
          searchTermsSynced: data.searchTermsSynced,
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar SyncRun "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.syncRun.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir SyncRun "${id.toString()}"`, { cause: error }));
    }
  }
}
