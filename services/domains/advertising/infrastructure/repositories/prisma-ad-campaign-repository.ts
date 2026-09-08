import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { AdCampaign } from "../../domain/aggregates/ad-campaign/ad-campaign.js";
import type { AdCampaignRepository } from "../../domain/repositories/ad-campaign-repository.js";
import { PrismaAdCampaignMapper } from "../mappers/prisma-ad-campaign-mapper.js";

/** Implementação real de `AdCampaignRepository` — persistência via Prisma Client. Mesmo padrão de `PrismaAdvertisingAccountRepository`. */
export class PrismaAdCampaignRepository implements AdCampaignRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<AdCampaign>, InfrastructureError>> {
    try {
      const record = await this.client.adCampaign.findUnique({ where: { id: id.toString() } });
      if (!record) {
        return Result.ok(Option.none<AdCampaign>());
      }
      return Result.ok(Option.some(PrismaAdCampaignMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar AdCampaign "${id.toString()}"`, { cause: error }));
    }
  }

  async findByExternalCampaignId(
    advertisingAccountId: UniqueEntityId,
    externalCampaignId: string,
  ): Promise<Result<Option<AdCampaign>, InfrastructureError>> {
    try {
      const record = await this.client.adCampaign.findUnique({
        where: { advertisingAccountId_externalCampaignId: { advertisingAccountId: advertisingAccountId.toString(), externalCampaignId } },
      });
      if (!record) {
        return Result.ok(Option.none<AdCampaign>());
      }
      return Result.ok(Option.some(PrismaAdCampaignMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar AdCampaign por externalCampaignId "${externalCampaignId}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<AdCampaign[], InfrastructureError>> {
    try {
      const records = await this.client.adCampaign.findMany();
      return Result.ok(records.map((record) => PrismaAdCampaignMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar AdCampaigns", { cause: error }));
    }
  }

  async findByName(advertisingAccountId: UniqueEntityId, name: string): Promise<Result<Option<AdCampaign>, InfrastructureError>> {
    try {
      const record = await this.client.adCampaign.findFirst({
        where: { advertisingAccountId: advertisingAccountId.toString(), name },
      });
      if (!record) {
        return Result.ok(Option.none<AdCampaign>());
      }
      return Result.ok(Option.some(PrismaAdCampaignMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar AdCampaign por nome "${name}"`, { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.adCampaign.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de AdCampaign "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: AdCampaign): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaAdCampaignMapper.toPersistenceCreate(entity);
      await this.client.adCampaign.upsert({
        where: { id: data.id },
        create: data,
        update: {
          name: data.name,
          status: data.status,
          channelType: data.channelType,
          lastCostMicros: data.lastCostMicros,
          lastClicks: data.lastClicks,
          lastImpressions: data.lastImpressions,
          lastConversions: data.lastConversions,
          lastSyncedAt: data.lastSyncedAt,
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar AdCampaign "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.adCampaign.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir AdCampaign "${id.toString()}"`, { cause: error }));
    }
  }
}
