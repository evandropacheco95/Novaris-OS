import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Contract } from "../../../domain/aggregates/contract/contract.js";
import type { ContractRepository } from "../../../domain/repositories/contract-repository.js";
import type { ActivateContractCommand } from "../../commands/activate-contract/activate-contract.command.js";

/** ActivateContractHandler — Application Layer, Sales Domain (`ADR-0044`). */
export class ActivateContractHandler {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(command: ActivateContractCommand): Promise<Result<Contract, DomainError | InfrastructureError>> {
    const findResult = await this.contractRepository.findById(new UniqueEntityId(command.contractId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Contract "${command.contractId}" não encontrado`));
    }
    const contract = option.getOrElse(null as never);

    const activateResult = contract.activate();
    if (activateResult.isFailure) {
      return Result.fail(activateResult.getError()!);
    }

    const saveResult = await this.contractRepository.save(contract);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(contract);
  }
}
