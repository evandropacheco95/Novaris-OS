import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Pipeline } from "../../../domain/aggregates/pipeline/pipeline.js";
import type { PipelineRepository } from "../../../domain/repositories/pipeline-repository.js";
import type { RenamePipelineCommand } from "../../commands/rename-pipeline/rename-pipeline.command.js";

/** RenamePipelineHandler — Application Layer, Sales Domain (`ADR-0051`). */
export class RenamePipelineHandler {
  constructor(private readonly pipelineRepository: PipelineRepository) {}

  async execute(command: RenamePipelineCommand): Promise<Result<Pipeline, DomainError | InfrastructureError>> {
    const findResult = await this.pipelineRepository.findById(new UniqueEntityId(command.pipelineId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Pipeline "${command.pipelineId}" não encontrada`));
    }
    const pipeline = option.getOrElse(null as never);

    const renameResult = pipeline.rename(command.name);
    if (renameResult.isFailure) {
      return Result.fail(renameResult.getError()!);
    }

    const saveResult = await this.pipelineRepository.save(pipeline);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(pipeline);
  }
}
