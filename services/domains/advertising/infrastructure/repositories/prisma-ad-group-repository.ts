import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { AdGroup } from "../../domain/aggregates/ad-group/ad-group.js";
import type { AdGroupRepository } from "../../domain/repositories/ad-group-repository.js";
import { PrismaAdGroupMapper } from "../mappers/prisma-ad-group-mapper.js";

/** Implementação real de `AdGroupRepository` — persistência via Prisma Client. */
export class PrismaAdGroupRepository implements AdGroupRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<AdGroup>, InfrastructureError>> {
    try {
      const record = await this.client.adGroup.findUnique({ where: { id: id.toString() } });
      if (!record) {
        return Result.ok(Option.none<AdGroup>());
      }
      return Result.ok(Option.some(PrismaAdGroupMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar AdGroup "${id.toString()}"`, { cause: error }));
    }
  }

  async findByExternalAdGroupId(
    advertisingAccountId: UniqueEntityId,
    externalAdGroupId: string,
  ): Promise<Result<Option<AdGroup>, InfrastructureError>> {
    try {
      const record = await this.client.adGroup.findUnique({
        where: { advertisingAccountId_externalAdGroupId: { advertisingAccountId: advertisingAccountId.toString(), externalAdGroupId } },
      });
      if (!record) {
        return Result.ok(Option.none<AdGroup>());
      }
      return Result.ok(Option.some(PrismaAdGroupMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar AdGroup por externalAdGroupId "${externalAdGroupId}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<AdGroup[], InfrastructureError>> {
    try {
      const records = await this.client.adGroup.findMany();
      return Result.ok(records.map((record) => PrismaAdGroupMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar AdGroups", { cause: error }));
    }
  }

  async findByName(advertisingAccountId: UniqueEntityId, name: string): Promise<Result<Option<AdGroup>, InfrastructureError>> {
    try {
      const record = await this.client.adGroup.findFirst({
        where: { advertisingAccountId: advertisingAccountId.toString(), name },
      });
      if (!record) {
        return Result.ok(Option.none<AdGroup>());
      }
      return Result.ok(Option.some(PrismaAdGroupMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar AdGroup por nome "${name}"`, { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.adGroup.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de AdGroup "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: AdGroup): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaAdGroupMapper.toPersistenceCreate(entity);
      await this.client.adGroup.upsert({
        where: { id: data.id },
        create: data,
        update: { name: data.name, status: data.status, lastSyncedAt: data.lastSyncedAt },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar AdGroup "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.adGroup.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir AdGroup "${id.toString()}"`, { cause: error }));
    }
  }
}
