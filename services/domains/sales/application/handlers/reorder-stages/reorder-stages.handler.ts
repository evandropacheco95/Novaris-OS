import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Pipeline } from "../../../domain/aggregates/pipeline/pipeline.js";
import type { PipelineRepository } from "../../../domain/repositories/pipeline-repository.js";
import type { ReorderStagesCommand } from "../../commands/reorder-stages/reorder-stages.command.js";

/** ReorderStagesHandler — Application Layer, Sales Domain (`ADR-0051`). */
export class ReorderStagesHandler {
  constructor(private readonly pipelineRepository: PipelineRepository) {}

  async execute(command: ReorderStagesCommand): Promise<Result<Pipeline, DomainError | InfrastructureError>> {
    const findResult = await this.pipelineRepository.findById(new UniqueEntityId(command.pipelineId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Pipeline "${command.pipelineId}" não encontrada`));
    }
    const pipeline = option.getOrElse(null as never);

    const reorderResult = pipeline.reorderStages(command.orderedStageIds.map((id) => new UniqueEntityId(id)));
    if (reorderResult.isFailure) {
      return Result.fail(reorderResult.getError()!);
    }

    const saveResult = await this.pipelineRepository.save(pipeline);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(pipeline);
  }
}
