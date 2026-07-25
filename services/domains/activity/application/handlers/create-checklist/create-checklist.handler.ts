import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Checklist } from "../../../domain/aggregates/checklist/checklist.js";
import type { ChecklistRepository } from "../../../domain/repositories/checklist-repository.js";
import type { CreateChecklistCommand } from "../../commands/create-checklist/create-checklist.command.js";

/** CreateChecklistHandler — Application Layer, Activity Domain (`ADR-0045`). */
export class CreateChecklistHandler {
  constructor(private readonly checklistRepository: ChecklistRepository) {}

  async execute(command: CreateChecklistCommand): Promise<Result<Checklist, DomainError | InfrastructureError>> {
    const createResult = Checklist.create({
      organizationId: new UniqueEntityId(command.organizationId),
      partyId: new UniqueEntityId(command.partyId),
      title: command.title,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const checklist = createResult.getValue()!;

    const saveResult = await this.checklistRepository.save(checklist);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(checklist);
  }
}
