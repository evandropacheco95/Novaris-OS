import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Pipeline } from "../../../domain/aggregates/pipeline/pipeline.js";
import type { PipelineRepository } from "../../../domain/repositories/pipeline-repository.js";
import type { CreatePipelineCommand } from "../../commands/create-pipeline/create-pipeline.command.js";

/** CreatePipelineHandler — Application Layer, Sales Domain (`ADR-0051`). */
export class CreatePipelineHandler {
  constructor(private readonly pipelineRepository: PipelineRepository) {}

  async execute(command: CreatePipelineCommand): Promise<Result<Pipeline, DomainError | InfrastructureError>> {
    const createResult = Pipeline.create({
      organizationId: new UniqueEntityId(command.organizationId),
      name: command.name,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const pipeline = createResult.getValue()!;

    const saveResult = await this.pipelineRepository.save(pipeline);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(pipeline);
  }
}
