import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Organization } from "../../domain/aggregates/organization/organization.js";
import type { OrganizationRepository } from "../../domain/repositories/organization-repository.js";
import { PrismaOrganizationMapper } from "../mappers/prisma-organization-mapper.js";

/**
 * Implementação real de `OrganizationRepository` — persistência via Prisma
 * Client contra Postgres (Supabase), mesmo padrão de `PrismaOpportunityRepository`
 * (Sales, `ENG-0120`). Implementa exclusivamente os 5 métodos já congelados
 * (`findById`, `findAll`, `exists`, `save`, `delete`) — nenhum método de
 * conveniência (ex.: `findBySlug`), mesma disciplina do Repository contract.
 */
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Organization>, InfrastructureError>> {
    try {
      const record = await this.client.organization.findUnique({ where: { id: id.toString(), deletedAt: null } });
      if (!record) {
        return Result.ok(Option.none<Organization>());
      }
      return Result.ok(Option.some(PrismaOrganizationMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Organization "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Organization[], InfrastructureError>> {
    try {
      const records = await this.client.organization.findMany({ where: { deletedAt: null } });
      return Result.ok(records.map((record) => PrismaOrganizationMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Organizations", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.organization.count({ where: { id: id.toString(), deletedAt: null } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Organization "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Organization): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaOrganizationMapper.toPersistenceCreate(entity);
      await this.client.organization.upsert({
        where: { id: data.id },
        create: data,
        update: {
          name: data.name,
          legalName: data.legalName,
          document: data.document,
          address: data.address,
          status: data.status,
          metadata: data.metadata,
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Organization "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.organization.update({ where: { id: id.toString() }, data: { deletedAt: new Date() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Organization "${id.toString()}"`, { cause: error }));
    }
  }
}
