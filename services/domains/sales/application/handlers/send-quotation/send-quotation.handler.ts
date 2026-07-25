import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Quotation } from "../../../domain/aggregates/quotation/quotation.js";
import type { QuotationRepository } from "../../../domain/repositories/quotation-repository.js";
import type { SendQuotationCommand } from "../../commands/send-quotation/send-quotation.command.js";

/** SendQuotationHandler — Application Layer, Sales Domain (`ADR-0043`). */
export class SendQuotationHandler {
  constructor(private readonly quotationRepository: QuotationRepository) {}

  async execute(command: SendQuotationCommand): Promise<Result<Quotation, DomainError | InfrastructureError>> {
    const findResult = await this.quotationRepository.findById(new UniqueEntityId(command.quotationId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Quotation "${command.quotationId}" não encontrada`));
    }
    const quotation = option.getOrElse(null as never);

    const sendResult = quotation.send();
    if (sendResult.isFailure) {
      return Result.fail(sendResult.getError()!);
    }

    const saveResult = await this.quotationRepository.save(quotation);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(quotation);
  }
}
