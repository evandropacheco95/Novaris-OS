import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Quotation } from "../../../domain/aggregates/quotation/quotation.js";
import type { QuotationRepository } from "../../../domain/repositories/quotation-repository.js";
import type { AcceptQuotationCommand } from "../../commands/accept-quotation/accept-quotation.command.js";

/** AcceptQuotationHandler — Application Layer, Sales Domain (`ADR-0043`). */
export class AcceptQuotationHandler {
  constructor(private readonly quotationRepository: QuotationRepository) {}

  async execute(command: AcceptQuotationCommand): Promise<Result<Quotation, DomainError | InfrastructureError>> {
    const findResult = await this.quotationRepository.findById(new UniqueEntityId(command.quotationId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Quotation "${command.quotationId}" não encontrada`));
    }
    const quotation = option.getOrElse(null as never);

    const acceptResult = quotation.accept();
    if (acceptResult.isFailure) {
      return Result.fail(acceptResult.getError()!);
    }

    const saveResult = await this.quotationRepository.save(quotation);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(quotation);
  }
}
