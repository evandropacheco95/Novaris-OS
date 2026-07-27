import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Pipeline as PrismaPipeline, Stage as PrismaStage } from "@novaris/database";
import { Pipeline, type PipelineProps } from "../../domain/aggregates/pipeline/pipeline.js";
import { Stage, type StageProps } from "../../domain/entities/stage/stage.js";

type PrismaPipelineWithStages = PrismaPipeline & { stages: PrismaStage[] };

/**
 * PrismaPipelineMapper — tradução pura Aggregate ↔ linhas reais do Postgres,
 * mesma disciplina de `PrismaOpportunityMapper`. `Stage` é tabela própria
 * (`pipeline_id` FK), nunca aninhada em JSON.
 */
export class PrismaPipelineMapper {
  static toPersistenceCreate(pipeline: Pipeline) {
    return {
      id: pipeline.id.toString(),
      organizationId: pipeline.organizationId.toString(),
      name: pipeline.name,
    };
  }

  static toDomain(record: PrismaPipelineWithStages): Pipeline {
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
