import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Task } from "../../../domain/entities/task/task.js";
import type { ProjectRepository } from "../../../domain/repositories/project-repository.js";
import type { AddTaskCommand } from "../../commands/add-task/add-task.command.js";

/**
 * AddTaskHandler — Application Layer, Project Domain.
 * Orquestra: `AddTaskCommand` → `ProjectRepository.findById()` →
 * `Project.addTask()` → `ProjectRepository.save()`. Mesmo padrão de
 * `SubmitProposalHandler` (Sales) — `Task` é criado pelo Aggregate Root, nunca
 * diretamente pela Application Layer.
 */
export class AddTaskHandler {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(command: AddTaskCommand): Promise<Result<Task, DomainError | InfrastructureError>> {
    const projectId = new UniqueEntityId(command.projectId);

    const findResult = await this.projectRepository.findById(projectId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Project "${command.projectId}" não encontrado`));
    }

    const project = option.getOrElse(null as never);
    const addResult = project.addTask({ title: command.title });
    if (addResult.isFailure) {
      return Result.fail(addResult.getError()!);
    }

    const saveResult = await this.projectRepository.save(project);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(addResult.getValue()!);
  }
}
