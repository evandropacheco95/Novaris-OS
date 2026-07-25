import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Relationship } from "../../domain/aggregates/relationship/relationship.js";
import type { RelationshipRepository } from "../../domain/repositories/relationship-repository.js";
import { PrismaRelationshipMapper } from "../mappers/prisma-relationship-mapper.js";

/**
 * Implementação real de `RelationshipRepository` — persistência via Prisma
 * Client contra Postgres (Supabase), mesmo padrão de `PrismaPartyRepository`.
 */
export class PrismaRelationshipRepository implements RelationshipRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Relationship>, InfrastructureError>> {
    try {
      const record = await this.client.relationship.findUnique({ where: { id: id.toString() } });
      if (!record) {
        return Result.ok(Option.none<Relationship>());
      }
      return Result.ok(Option.some(PrismaRelationshipMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Relationship "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Relationship[], InfrastructureError>> {
    try {
      const records = await this.client.relationship.findMany();
      return Result.ok(records.map((record) => PrismaRelationshipMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Relationships", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.relationship.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Relationship "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Relationship): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaRelationshipMapper.toPersistenceCreate(entity);
      await this.client.relationship.upsert({
        where: { id: data.id },
        create: data,
        update: { type: data.type },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Relationship "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.relationship.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Relationship "${id.toString()}"`, { cause: error }));
    }
  }
}
