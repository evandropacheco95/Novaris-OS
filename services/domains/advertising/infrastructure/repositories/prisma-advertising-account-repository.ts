import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { AdvertisingAccount } from "../../domain/aggregates/advertising-account/advertising-account.js";
import type { AdvertisingAccountRepository } from "../../domain/repositories/advertising-account-repository.js";
import { PrismaAdvertisingAccountMapper } from "../mappers/prisma-advertising-account-mapper.js";

/** Implementação real de `AdvertisingAccountRepository` — persistência via Prisma Client contra Postgres (Supabase). Mesmo padrão de `PrismaCampaignRepository`. */
export class PrismaAdvertisingAccountRepository implements AdvertisingAccountRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<AdvertisingAccount>, InfrastructureError>> {
    try {
      const record = await this.client.advertisingAccount.findUnique({ where: { id: id.toString() } });
      if (!record) {
        return Result.ok(Option.none<AdvertisingAccount>());
      }
      return Result.ok(Option.some(PrismaAdvertisingAccountMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar AdvertisingAccount "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<AdvertisingAccount[], InfrastructureError>> {
    try {
      const records = await this.client.advertisingAccount.findMany();
      return Result.ok(records.map((record) => PrismaAdvertisingAccountMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar AdvertisingAccounts", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.advertisingAccount.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de AdvertisingAccount "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: AdvertisingAccount): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaAdvertisingAccountMapper.toPersistenceCreate(entity);
      await this.client.advertisingAccount.upsert({
        where: { id: data.id },
        create: data,
        update: {
          externalAccountId: data.externalAccountId,
          name: data.name,
          connectionStatus: data.connectionStatus,
          connectedAt: data.connectedAt,
          lastSyncAt: data.lastSyncAt,
          encryptedRefreshToken: data.encryptedRefreshToken,
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar AdvertisingAccount "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.advertisingAccount.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir AdvertisingAccount "${id.toString()}"`, { cause: error }));
    }
  }
}
