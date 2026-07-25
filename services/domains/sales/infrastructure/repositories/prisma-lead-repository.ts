import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Lead } from "../../domain/aggregates/lead/lead.js";
import type { LeadRepository } from "../../domain/repositories/lead-repository.js";
import { PrismaLeadMapper } from "../mappers/prisma-lead-mapper.js";

/**
 * Implementação real de `LeadRepository` — persistência via Prisma Client
 * contra Postgres (Supabase). `delete()` é hard delete (mesma convenção da
 * maioria das tabelas de Business Domain — `parties`/`activities`/
 * `campaigns`/etc.) — diferente do soft delete de `Opportunity`
 * (`deletedAt`), que é uma decisão própria daquele Aggregate, não uma regra
 * obrigatória para todo o pacote `@novaris/sales`.
 */
export class PrismaLeadRepository implements LeadRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Lead>, InfrastructureError>> {
    try {
      const record = await this.client.lead.findUnique({ where: { id: id.toString() } });
      return Result.ok(record ? Option.some(PrismaLeadMapper.toDomain(record)) : Option.none<Lead>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Lead "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Lead[], InfrastructureError>> {
    try {
      const records = await this.client.lead.findMany();
      return Result.ok(records.map((record) => PrismaLeadMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Leads", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.lead.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Lead "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Lead): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaLeadMapper.toPersistence(entity);
      await this.client.lead.upsert({
        where: { id: data.id },
        create: data,
        update: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          source: data.source,
          status: data.status,
          convertedPartyId: data.convertedPartyId,
          convertedOpportunityId: data.convertedOpportunityId,
          updatedAt: data.updatedAt,
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Lead "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.lead.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Lead "${id.toString()}"`, { cause: error }));
    }
  }
}
