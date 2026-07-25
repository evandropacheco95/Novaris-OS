import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Quotation } from "../../../domain/aggregates/quotation/quotation.js";
import type { QuotationRepository } from "../../../domain/repositories/quotation-repository.js";
import type { CreateQuotationCommand } from "../../commands/create-quotation/create-quotation.command.js";

/** CreateQuotationHandler — Application Layer, Sales Domain (`ADR-0043`). */
export class CreateQuotationHandler {
  constructor(private readonly quotationRepository: QuotationRepository) {}

  async execute(command: CreateQuotationCommand): Promise<Result<Quotation, DomainError | InfrastructureError>> {
    const createResult = Quotation.create({
      organizationId: new UniqueEntityId(command.organizationId),
      opportunityId: new UniqueEntityId(command.opportunityId),
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const quotation = createResult.getValue()!;

    const saveResult = await this.quotationRepository.save(quotation);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(quotation);
  }
}
