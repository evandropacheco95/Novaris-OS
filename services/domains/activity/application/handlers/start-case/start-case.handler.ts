import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Case } from "../../../domain/aggregates/case/case.js";
import type { CaseRepository } from "../../../domain/repositories/case-repository.js";
import type { StartCaseCommand } from "../../commands/start-case/start-case.command.js";

/** StartCaseHandler — Application Layer, Activity Domain (`ADR-0043`). */
export class StartCaseHandler {
  constructor(private readonly caseRepository: CaseRepository) {}

  async execute(command: StartCaseCommand): Promise<Result<Case, DomainError | InfrastructureError>> {
    const findResult = await this.caseRepository.findById(new UniqueEntityId(command.caseId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Case "${command.caseId}" não encontrado`));
    }
    const caseInstance = option.getOrElse(null as never);

    const startResult = caseInstance.start();
    if (startResult.isFailure) {
      return Result.fail(startResult.getError()!);
    }

    const saveResult = await this.caseRepository.save(caseInstance);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(caseInstance);
  }
}
