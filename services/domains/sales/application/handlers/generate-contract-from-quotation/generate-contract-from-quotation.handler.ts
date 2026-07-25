import { Result, UniqueEntityId, NotFoundError, ConflictError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Contract } from "../../../domain/aggregates/contract/contract.js";
import type { ContractRepository } from "../../../domain/repositories/contract-repository.js";
import type { QuotationRepository } from "../../../domain/repositories/quotation-repository.js";
import type { GenerateContractFromQuotationCommand } from "../../commands/generate-contract-from-quotation/generate-contract-from-quotation.command.js";

/**
 * GenerateContractFromQuotationHandler — Application Layer, Sales Domain
 * (`ADR-0044`). Composição intra-domínio (Sales→Sales), mesmo padrão de
 * `AddQuotationLineItemHandler` (`ADR-0043`) — busca a `Quotation` real,
 * exige `status === "accepted"` (falha com `ConflictError` caso contrário,
 * nunca gerado automaticamente por `Quotation.accept()`), copia
 * `organizationId`/`opportunityId` da Quotation para o novo `Contract`.
 */
export class GenerateContractFromQuotationHandler {
  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly quotationRepository: QuotationRepository,
  ) {}

  async execute(command: GenerateContractFromQuotationCommand): Promise<Result<Contract, DomainError | InfrastructureError>> {
    const findResult = await this.quotationRepository.findById(new UniqueEntityId(command.quotationId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Quotation "${command.quotationId}" não encontrada`));
    }
    const quotation = option.getOrElse(null as never);

    if (quotation.status !== "accepted") {
      return Result.fail(new ConflictError(`Contract só pode ser gerado a partir de uma Quotation "accepted" (atual: "${quotation.status}")`));
    }

    const createResult = Contract.create({
      organizationId: quotation.organizationId,
      opportunityId: quotation.opportunityId,
      quotationId: quotation.id,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const contract = createResult.getValue()!;

    const saveResult = await this.contractRepository.save(contract);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(contract);
  }
}
