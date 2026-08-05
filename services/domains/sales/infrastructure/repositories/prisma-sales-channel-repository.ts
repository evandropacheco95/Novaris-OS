import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { SalesChannel } from "../../domain/aggregates/sales-channel/sales-channel.js";
import type { SalesChannelRepository } from "../../domain/repositories/sales-channel-repository.js";
import { PrismaSalesChannelMapper } from "../mappers/prisma-sales-channel-mapper.js";

/** Implementação real de `SalesChannelRepository` — Prisma Client contra Postgres, mesmo padrão de `PrismaProductRepository` (`ADR-0052`). */
export class PrismaSalesChannelRepository implements SalesChannelRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<SalesChannel>, InfrastructureError>> {
    try {
      const record = await this.client.salesChannel.findUnique({ where: { id: id.toString() } });
      return Result.ok(record ? Option.some(PrismaSalesChannelMapper.toDomain(record)) : Option.none<SalesChannel>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar SalesChannel "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<SalesChannel[], InfrastructureError>> {
    try {
      const records = await this.client.salesChannel.findMany();
      return Result.ok(records.map((record) => PrismaSalesChannelMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar SalesChannels", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.salesChannel.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de SalesChannel "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: SalesChannel): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaSalesChannelMapper.toPersistence(entity);
      await this.client.salesChannel.upsert({
        where: { id: data.id },
        create: data,
        update: {
          name: data.name,
          type: data.type,
          active: data.active,
          updatedAt: data.updatedAt,
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar SalesChannel "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.salesChannel.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir SalesChannel "${id.toString()}"`, { cause: error }));
    }
  }
}
