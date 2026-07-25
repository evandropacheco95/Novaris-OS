import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Campaign } from "../../domain/aggregates/campaign/campaign.js";
import type { CampaignRepository } from "../../domain/repositories/campaign-repository.js";
import { PrismaCampaignMapper } from "../mappers/prisma-campaign-mapper.js";

/** Implementação real de `CampaignRepository` — persistência via Prisma Client contra Postgres (Supabase). */
export class PrismaCampaignRepository implements CampaignRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Campaign>, InfrastructureError>> {
    try {
      const record = await this.client.campaign.findUnique({ where: { id: id.toString() } });
      if (!record) {
        return Result.ok(Option.none<Campaign>());
      }
      return Result.ok(Option.some(PrismaCampaignMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Campaign "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Campaign[], InfrastructureError>> {
    try {
      const records = await this.client.campaign.findMany();
      return Result.ok(records.map((record) => PrismaCampaignMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Campaigns", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.campaign.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Campaign "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Campaign): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaCampaignMapper.toPersistenceCreate(entity);
      await this.client.campaign.upsert({
        where: { id: data.id },
        create: data,
        update: { name: data.name, startDate: data.startDate, endDate: data.endDate },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Campaign "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.campaign.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Campaign "${id.toString()}"`, { cause: error }));
    }
  }
}
