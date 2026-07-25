import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Project } from "../../../domain/aggregates/project/project.js";
import type { ProjectRepository } from "../../../domain/repositories/project-repository.js";
import type { CreateProjectCommand } from "../../commands/create-project/create-project.command.js";

/**
 * CreateProjectHandler — Application Layer, Project Domain.
 * Orquestra: `CreateProjectCommand` → `Project.create()` → `ProjectRepository.save()`.
 * `save()` sempre verificado, nunca descartado (`ENG-0126`).
 */
export class CreateProjectHandler {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(command: CreateProjectCommand): Promise<Result<Project, DomainError | InfrastructureError>> {
    const createResult = Project.create({
      organizationId: new UniqueEntityId(command.organizationId),
      name: command.name,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }

    const project = createResult.getValue()!;
    const saveResult = await this.projectRepository.save(project);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(project);
  }
}
