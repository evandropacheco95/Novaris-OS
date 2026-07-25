import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Case } from "../../../domain/aggregates/case/case.js";
import type { CaseRepository } from "../../../domain/repositories/case-repository.js";
import type { CreateCaseCommand } from "../../commands/create-case/create-case.command.js";

/** CreateCaseHandler — Application Layer, Activity Domain (`ADR-0043`). */
export class CreateCaseHandler {
  constructor(private readonly caseRepository: CaseRepository) {}

  async execute(command: CreateCaseCommand): Promise<Result<Case, DomainError | InfrastructureError>> {
    const createResult = Case.create({
      organizationId: new UniqueEntityId(command.organizationId),
      partyId: new UniqueEntityId(command.partyId),
      subject: command.subject,
      description: command.description,
      priority: command.priority,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const caseInstance = createResult.getValue()!;

    const saveResult = await this.caseRepository.save(caseInstance);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(caseInstance);
  }
}
