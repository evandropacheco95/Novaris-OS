import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Keyword } from "../../domain/aggregates/keyword/keyword.js";
import type { KeywordRepository } from "../../domain/repositories/keyword-repository.js";
import { PrismaKeywordMapper } from "../mappers/prisma-keyword-mapper.js";

/** Implementação real de `KeywordRepository` — persistência via Prisma Client. */
export class PrismaKeywordRepository implements KeywordRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Keyword>, InfrastructureError>> {
    try {
      const record = await this.client.keyword.findUnique({ where: { id: id.toString() } });
      if (!record) {
        return Result.ok(Option.none<Keyword>());
      }
      return Result.ok(Option.some(PrismaKeywordMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Keyword "${id.toString()}"`, { cause: error }));
    }
  }

  async findByExternalCriterionId(
    advertisingAccountId: UniqueEntityId,
    externalCriterionId: string,
  ): Promise<Result<Option<Keyword>, InfrastructureError>> {
    try {
      const record = await this.client.keyword.findUnique({
        where: { advertisingAccountId_externalCriterionId: { advertisingAccountId: advertisingAccountId.toString(), externalCriterionId } },
      });
      if (!record) {
        return Result.ok(Option.none<Keyword>());
      }
      return Result.ok(Option.some(PrismaKeywordMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Keyword por externalCriterionId "${externalCriterionId}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Keyword[], InfrastructureError>> {
    try {
      const records = await this.client.keyword.findMany();
      return Result.ok(records.map((record) => PrismaKeywordMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Keywords", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.keyword.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Keyword "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Keyword): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaKeywordMapper.toPersistenceCreate(entity);
      await this.client.keyword.upsert({
        where: { id: data.id },
        create: data,
        update: {
          text: data.text,
          matchType: data.matchType,
          status: data.status,
          qualityScore: data.qualityScore,
          lastCostMicros: data.lastCostMicros,
          lastClicks: data.lastClicks,
          lastImpressions: data.lastImpressions,
          lastSyncedAt: data.lastSyncedAt,
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Keyword "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.keyword.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Keyword "${id.toString()}"`, { cause: error }));
    }
  }
}
