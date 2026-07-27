import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Stage } from "../../../domain/entities/stage/stage.js";
import type { Pipeline } from "../../../domain/aggregates/pipeline/pipeline.js";
import type { PipelineRepository } from "../../../domain/repositories/pipeline-repository.js";
import type { AddStageCommand } from "../../commands/add-stage/add-stage.command.js";

/** AddStageHandler — Application Layer, Sales Domain (`ADR-0051`). */
export class AddStageHandler {
  constructor(private readonly pipelineRepository: PipelineRepository) {}

  async execute(command: AddStageCommand): Promise<Result<Pipeline, DomainError | InfrastructureError>> {
    const findResult = await this.pipelineRepository.findById(new UniqueEntityId(command.pipelineId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Pipeline "${command.pipelineId}" não encontrada`));
    }
    const pipeline = option.getOrElse(null as never);

    // `order` é reatribuído por `Pipeline.addStage()` (próximo índice livre) —
    // o valor aqui é só o placeholder exigido por `CreateStageInput`.
    const stageResult = Stage.create({ name: command.name, order: 0 });
    if (stageResult.isFailure) {
      return Result.fail(stageResult.getError()!);
    }

    const addResult = pipeline.addStage(stageResult.getValue()!);
    if (addResult.isFailure) {
      return Result.fail(addResult.getError()!);
    }

    const saveResult = await this.pipelineRepository.save(pipeline);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(pipeline);
  }
}
