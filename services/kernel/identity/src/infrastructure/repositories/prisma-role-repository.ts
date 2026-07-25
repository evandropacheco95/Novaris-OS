import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Role } from "../../domain/aggregates/role/role.js";
import type { RoleRepository } from "../../domain/repositories/role-repository.js";
import { PrismaRoleMapper } from "../mappers/prisma-role-mapper.js";

/**
 * Implementação real de `RoleRepository` — persistência via Prisma Client
 * contra Postgres (Supabase), mesmo padrão de `PrismaUserRepository`.
 */
export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Role>, InfrastructureError>> {
    try {
      const record = await this.client.role.findUnique({ where: { id: id.toString() } });
      if (!record) {
        return Result.ok(Option.none<Role>());
      }
      return Result.ok(Option.some(PrismaRoleMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Role "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Role[], InfrastructureError>> {
    try {
      const records = await this.client.role.findMany();
      return Result.ok(records.map((record) => PrismaRoleMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Roles", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.role.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Role "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Role): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaRoleMapper.toPersistenceCreate(entity);
      await this.client.role.upsert({
        where: { id: data.id },
        create: data,
        update: {
          name: data.name,
          permissions: data.permissions,
          updatedBy: data.updatedBy,
          version: data.version,
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Role "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.role.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Role "${id.toString()}"`, { cause: error }));
    }
  }
}
