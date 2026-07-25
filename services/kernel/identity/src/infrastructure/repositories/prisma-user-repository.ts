import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { User } from "../../domain/aggregates/user/user.js";
import type { UserRepository } from "../../domain/repositories/user-repository.js";
import { PrismaUserMapper } from "../mappers/prisma-user-mapper.js";

/**
 * Implementação real de `UserRepository` — persistência via Prisma Client
 * contra Postgres (Supabase), mesmo padrão de `PrismaOpportunityRepository`
 * (Sales, `ENG-0120`). Implementa exclusivamente os 5 métodos já congelados
 * (`findById`, `findAll`, `exists`, `save`, `delete`) — `findAll()` é usado
 * hoje por `AuthenticationDomainService` para localizar por email (nenhum
 * índice/consulta própria foi acrescentada ao contrato, `user-repository.ts`).
 */
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<User>, InfrastructureError>> {
    try {
      const record = await this.client.user.findUnique({ where: { id: id.toString() } });
      if (!record) {
        return Result.ok(Option.none<User>());
      }
      return Result.ok(Option.some(PrismaUserMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar User "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<User[], InfrastructureError>> {
    try {
      const records = await this.client.user.findMany();
      return Result.ok(records.map((record) => PrismaUserMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Users", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.user.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de User "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: User): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaUserMapper.toPersistenceCreate(entity);
      await this.client.user.upsert({
        where: { id: data.id },
        create: data,
        update: {
          status: data.status,
          roleIds: data.roleIds,
          updatedBy: data.updatedBy,
          version: data.version,
          metadata: data.metadata,
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar User "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.user.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir User "${id.toString()}"`, { cause: error }));
    }
  }
}
