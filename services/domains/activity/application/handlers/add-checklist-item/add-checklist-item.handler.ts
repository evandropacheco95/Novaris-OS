import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Checklist } from "../../../domain/aggregates/checklist/checklist.js";
import type { ChecklistRepository } from "../../../domain/repositories/checklist-repository.js";
import type { AddChecklistItemCommand } from "../../commands/add-checklist-item/add-checklist-item.command.js";

/** AddChecklistItemHandler — Application Layer, Activity Domain (`ADR-0045`). */
export class AddChecklistItemHandler {
  constructor(private readonly checklistRepository: ChecklistRepository) {}

  async execute(command: AddChecklistItemCommand): Promise<Result<Checklist, DomainError | InfrastructureError>> {
    const findResult = await this.checklistRepository.findById(new UniqueEntityId(command.checklistId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Checklist "${command.checklistId}" não encontrado`));
    }
    const checklist = option.getOrElse(null as never);

    const addResult = checklist.addItem(command.label);
    if (addResult.isFailure) {
      return Result.fail(addResult.getError()!);
    }

    const saveResult = await this.checklistRepository.save(checklist);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(checklist);
  }
}
