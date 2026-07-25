import { Option, Result } from "@novaris/shared-kernel";
import type { UniqueEntityId, InfrastructureError } from "@novaris/shared-kernel";
import type { Pipeline } from "../../domain/aggregates/pipeline/pipeline.js";
import type { PipelineRepository } from "../../domain/repositories/pipeline-repository.js";
import type { PipelineRecord } from "../persistence/pipeline-record.js";
import { PipelineMapper } from "../mappers/pipeline-mapper.js";

/**
 * Implementação concreta de `PipelineRepository` — mesma estratégia de
 * `InMemoryOpportunityRepository`: armazenamento em memória (`Map`), sem
 * banco, ORM ou schema real (restrição explícita de `ENG-0050`).
 *
 * Traceability: [PipelineRepository](../../domain/repositories/pipeline-repository.ts)
 * (`ENG-0045`) — implementa exclusivamente os 5 métodos já congelados,
 * nenhum método de conveniência. Usa `PipelineMapper` para toda tradução.
 */
export class InMemoryPipelineRepository implements PipelineRepository {
  private readonly records = new Map<string, PipelineRecord>();

  async findById(id: UniqueEntityId): Promise<Result<Option<Pipeline>, InfrastructureError>> {
    const record = this.records.get(id.toString());
    if (!record) {
      return Result.ok(Option.none<Pipeline>());
    }
    return Result.ok(Option.some(PipelineMapper.toDomain(record)));
  }

  async findAll(): Promise<Result<Pipeline[], InfrastructureError>> {
    const pipelines = Array.from(this.records.values()).map((record) => PipelineMapper.toDomain(record));
    return Result.ok(pipelines);
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.records.has(id.toString()));
  }

  async save(entity: Pipeline): Promise<Result<void, InfrastructureError>> {
    this.records.set(entity.id.toString(), PipelineMapper.toPersistence(entity));
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.records.delete(id.toString());
    return Result.ok(undefined);
  }
}
