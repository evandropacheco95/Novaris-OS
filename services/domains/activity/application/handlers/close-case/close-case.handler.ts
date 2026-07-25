import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Case } from "../../../domain/aggregates/case/case.js";
import type { CaseRepository } from "../../../domain/repositories/case-repository.js";
import type { CloseCaseCommand } from "../../commands/close-case/close-case.command.js";

/** CloseCaseHandler — Application Layer, Activity Domain (`ADR-0043`). */
export class CloseCaseHandler {
  constructor(private readonly caseRepository: CaseRepository) {}

  async execute(command: CloseCaseCommand): Promise<Result<Case, DomainError | InfrastructureError>> {
    const findResult = await this.caseRepository.findById(new UniqueEntityId(command.caseId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Case "${command.caseId}" não encontrado`));
    }
    const caseInstance = option.getOrElse(null as never);

    const closeResult = caseInstance.close();
    if (closeResult.isFailure) {
      return Result.fail(closeResult.getError()!);
    }

    const saveResult = await this.caseRepository.save(caseInstance);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(caseInstance);
  }
}
