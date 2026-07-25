import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Pipeline } from "../../domain/aggregates/pipeline/pipeline.js";
import type { PipelineRepository } from "../../domain/repositories/pipeline-repository.js";
import { PrismaPipelineMapper } from "../mappers/prisma-pipeline-mapper.js";

/**
 * Implementação real de `PipelineRepository` — persistência via Prisma Client
 * contra Postgres (Supabase), substituindo o estágio interino
 * `InMemoryPipelineRepository`. Implementa exclusivamente os 5 métodos já
 * congelados — nenhum método de conveniência.
 *
 * `save()` sincroniza a coleção de `Stage`s via upsert dentro de uma
 * transação — `Stage` é Internal Entity sem Repository próprio, persistida
 * exclusivamente como parte do `Pipeline` que a possui.
 */
export class PrismaPipelineRepository implements PipelineRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Pipeline>, InfrastructureError>> {
    try {
      const record = await this.client.pipeline.findUnique({
        where: { id: id.toString(), deletedAt: null },
        include: { stages: true },
      });
      if (!record) {
        return Result.ok(Option.none<Pipeline>());
      }
      return Result.ok(Option.some(PrismaPipelineMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Pipeline "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Pipeline[], InfrastructureError>> {
    try {
      const records = await this.client.pipeline.findMany({
        where: { deletedAt: null },
        include: { stages: true },
      });
      return Result.ok(records.map((record) => PrismaPipelineMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Pipelines", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.pipeline.count({ where: { id: id.toString(), deletedAt: null } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Pipeline "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Pipeline): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaPipelineMapper.toPersistenceCreate(entity);
      await this.client.$transaction([
        this.client.pipeline.upsert({
          where: { id: data.id },
          create: data,
          update: {},
        }),
        ...entity.getStages().map((stage) =>
          this.client.stage.upsert({
            where: { id: stage.id.toString() },
            create: {
              id: stage.id.toString(),
              pipelineId: entity.id.toString(),
              name: stage.name,
            },
            update: {
              name: stage.name,
            },
          }),
        ),
      ]);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Pipeline "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.pipeline.update({
        where: { id: id.toString() },
        data: { deletedAt: new Date() },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Pipeline "${id.toString()}"`, { cause: error }));
    }
  }
}
