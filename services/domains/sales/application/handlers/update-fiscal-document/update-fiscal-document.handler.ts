import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Contract } from "../../../domain/aggregates/contract/contract.js";
import type { ContractRepository } from "../../../domain/repositories/contract-repository.js";
import type { UpdateFiscalDocumentCommand } from "../../commands/update-fiscal-document/update-fiscal-document.command.js";

/** UpdateFiscalDocumentHandler — Application Layer, Sales Domain (`ENG-0169`). */
export class UpdateFiscalDocumentHandler {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(command: UpdateFiscalDocumentCommand): Promise<Result<Contract, DomainError | InfrastructureError>> {
    const findResult = await this.contractRepository.findById(new UniqueEntityId(command.contractId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Contract "${command.contractId}" não encontrado`));
    }
    const contract = option.getOrElse(null as never);

    const updateResult = contract.updateFiscalDocument({
      fiscalDocumentNumber: command.fiscalDocumentNumber,
      fiscalDocumentAccessKey: command.fiscalDocumentAccessKey,
      fiscalDocumentIssuedAt: command.fiscalDocumentIssuedAt,
    });
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError()!);
    }

    const saveResult = await this.contractRepository.save(contract);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(contract);
  }
}
