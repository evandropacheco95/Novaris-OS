import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Quotation } from "../../../domain/aggregates/quotation/quotation.js";
import type { QuotationRepository } from "../../../domain/repositories/quotation-repository.js";
import type { RejectQuotationCommand } from "../../commands/reject-quotation/reject-quotation.command.js";

/** RejectQuotationHandler — Application Layer, Sales Domain (`ADR-0043`). */
export class RejectQuotationHandler {
  constructor(private readonly quotationRepository: QuotationRepository) {}

  async execute(command: RejectQuotationCommand): Promise<Result<Quotation, DomainError | InfrastructureError>> {
    const findResult = await this.quotationRepository.findById(new UniqueEntityId(command.quotationId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Quotation "${command.quotationId}" não encontrada`));
    }
    const quotation = option.getOrElse(null as never);

    const rejectResult = quotation.reject();
    if (rejectResult.isFailure) {
      return Result.fail(rejectResult.getError()!);
    }

    const saveResult = await this.quotationRepository.save(quotation);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(quotation);
  }
}
