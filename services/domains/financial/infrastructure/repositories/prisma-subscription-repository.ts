import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Subscription } from "../../domain/aggregates/subscription/subscription.js";
import type { SubscriptionRepository } from "../../domain/repositories/subscription-repository.js";
import { PrismaSubscriptionMapper } from "../mappers/prisma-subscription-mapper.js";

/** Implementação real de `SubscriptionRepository` — persistência via Prisma Client. */
export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Subscription>, InfrastructureError>> {
    try {
      const record = await this.client.subscription.findUnique({ where: { id: id.toString() } });
      if (!record) {
        return Result.ok(Option.none<Subscription>());
      }
      return Result.ok(Option.some(PrismaSubscriptionMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Subscription "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Subscription[], InfrastructureError>> {
    try {
      const records = await this.client.subscription.findMany();
      return Result.ok(records.map((record) => PrismaSubscriptionMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Subscriptions", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.subscription.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Subscription "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Subscription): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaSubscriptionMapper.toPersistenceCreate(entity);
      await this.client.subscription.upsert({
        where: { id: data.id },
        create: data,
        update: { name: data.name },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Subscription "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.subscription.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Subscription "${id.toString()}"`, { cause: error }));
    }
  }
}
