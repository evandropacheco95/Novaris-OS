import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Opportunity } from "../../domain/aggregates/opportunity/opportunity.js";
import type { OpportunityRepository } from "../../domain/repositories/opportunity-repository.js";
import { PrismaOpportunityMapper } from "../mappers/prisma-opportunity-mapper.js";

/**
 * Implementação real de `OpportunityRepository` — persistência via Prisma
 * Client contra Postgres (Supabase), substituindo o estágio interino
 * `InMemoryOpportunityRepository` (`ENG-0050`). Implementa exclusivamente os
 * 5 métodos já congelados (`findById`, `findAll`, `exists`, `save`, `delete`)
 * — nenhum método de conveniência.
 *
 * `save()` sincroniza a coleção de `Proposal`s via upsert dentro de uma
 * transação — necessário porque `Proposal` é Internal Entity sem Repository
 * próprio (`SALES_TECHNICAL_BLUEPRINT.md § 3`); persistida exclusivamente
 * como parte do `Opportunity` que a possui, mesmo princípio já aplicado por
 * `InMemoryOpportunityRepository`/`OpportunityMapper`.
 *
 * Toda falha do Postgres é traduzida para `InfrastructureError` — nunca
 * propagada como exceção não tratada, mesmo padrão de toda Infrastructure
 * Layer desta engenharia (`ENGINEERING_PLAYBOOK.md § 10`).
 */
export class PrismaOpportunityRepository implements OpportunityRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Opportunity>, InfrastructureError>> {
    try {
      const record = await this.client.opportunity.findUnique({
        where: { id: id.toString(), deletedAt: null },
        include: { proposals: true },
      });
      if (!record) {
        return Result.ok(Option.none<Opportunity>());
      }
      return Result.ok(Option.some(PrismaOpportunityMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Opportunity "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Opportunity[], InfrastructureError>> {
    try {
      const records = await this.client.opportunity.findMany({
        where: { deletedAt: null },
        include: { proposals: true },
      });
      return Result.ok(records.map((record) => PrismaOpportunityMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Opportunities", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.opportunity.count({ where: { id: id.toString(), deletedAt: null } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Opportunity "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Opportunity): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaOpportunityMapper.toPersistenceCreate(entity);
      await this.client.$transaction([
        this.client.opportunity.upsert({
          where: { id: data.id },
          create: data,
          update: {
            pipelineId: data.pipelineId,
            currentStageId: data.currentStageId,
            status: data.status,
          },
        }),
        ...entity.getProposals().map((proposal) =>
          this.client.proposal.upsert({
            where: { id: proposal.id.toString() },
            create: {
              id: proposal.id.toString(),
              opportunityId: entity.id.toString(),
              status: proposal.status,
              createdAt: proposal.createdAt,
              updatedAt: proposal.updatedAt,
            },
            update: {
              status: proposal.status,
              updatedAt: proposal.updatedAt,
            },
          }),
        ),
      ]);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Opportunity "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.opportunity.update({
        where: { id: id.toString() },
        data: { deletedAt: new Date() },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Opportunity "${id.toString()}"`, { cause: error }));
    }
  }
}
