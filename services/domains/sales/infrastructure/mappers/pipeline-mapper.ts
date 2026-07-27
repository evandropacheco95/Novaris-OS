import { UniqueEntityId } from "@novaris/shared-kernel";
import { Pipeline, type PipelineProps } from "../../domain/aggregates/pipeline/pipeline.js";
import { Stage, type StageProps } from "../../domain/entities/stage/stage.js";
import type { PipelineRecord, StageRecord } from "../persistence/pipeline-record.js";

/**
 * PipelineMapper — tradução pura Aggregate ↔ Persistência, sem I/O.
 *
 * Traceability: [SALES_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 9, 11](../../../../../knowledge/architecture/blueprints/SALES_PERSISTENCE_MAPPING_BLUEPRINT.md),
 * [AGGREGATE_IMPLEMENTATION_STANDARD.md § 8](../../../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md)
 * (ENS-0001). Mesma lista de restrições de `OpportunityMapper` — nenhuma
 * regra de negócio, nenhum Domain Event, nenhuma tecnologia na assinatura
 * pública.
 */
export class PipelineMapper {
  static toPersistence(pipeline: Pipeline): PipelineRecord {
    const stages: StageRecord[] = pipeline.getStages().map((stage) => ({
      id: stage.id.toString(),
      name: stage.name,
      order: stage.order,
    }));

    return {
      id: pipeline.id.toString(),
      organizationId: pipeline.organizationId.toString(),
      name: pipeline.name,
      createdAt: pipeline.createdAt,
      updatedAt: pipeline.updatedAt,
      stages,
    };
  }

  /** Reconstrói via `Pipeline.reconstitute()`/`Stage.reconstitute()` — sem validação, sem Domain Events (ENS-0001 § 8). */
  static toDomain(record: PipelineRecord): Pipeline {
    const stages: Stage[] = [...record.stages]
      .sort((a, b) => a.order - b.order)
      .map((stageRecord) => {
        const stageProps: StageProps = { name: stageRecord.name, order: stageRecord.order };
        return Stage.reconstitute(stageProps, new UniqueEntityId(stageRecord.id));
      });

    const props: PipelineProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      name: record.name,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return Pipeline.reconstitute(props, new UniqueEntityId(record.id), stages);
  }
}
