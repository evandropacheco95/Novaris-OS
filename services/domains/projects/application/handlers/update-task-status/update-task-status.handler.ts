import { Result, UniqueEntityId, NotFoundError, ValidationError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Task, TaskStatus } from "../../../domain/entities/task/task.js";
import type { ProjectRepository } from "../../../domain/repositories/project-repository.js";
import type { UpdateTaskStatusCommand } from "../../commands/update-task-status/update-task-status.command.js";

const VALID_STATUSES: readonly TaskStatus[] = ["pending", "in_progress", "completed", "cancelled"];

/**
 * UpdateTaskStatusHandler — Application Layer, Project Domain.
 * Orquestra: `UpdateTaskStatusCommand` → `ProjectRepository.findById()` →
 * `Project.findTask()` → `Task.updateStatus()` → `ProjectRepository.save()`.
 */
export class UpdateTaskStatusHandler {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(command: UpdateTaskStatusCommand): Promise<Result<Task, DomainError | InfrastructureError>> {
    if (!VALID_STATUSES.includes(command.status as TaskStatus)) {
      return Result.fail(new ValidationError(`"status" inválido: "${command.status}"`));
    }

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
    const task = project.findTask(new UniqueEntityId(command.taskId));
    if (!task) {
      return Result.fail(new NotFoundError(`Task "${command.taskId}" não encontrado`));
    }

    const updateResult = task.updateStatus(command.status as TaskStatus);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError()!);
    }

    const saveResult = await this.projectRepository.save(project);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(task);
  }
}
