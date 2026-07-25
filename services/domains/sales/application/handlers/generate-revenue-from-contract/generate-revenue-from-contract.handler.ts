import { Result, UniqueEntityId, NotFoundError, ConflictError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Revenue } from "../../../domain/aggregates/revenue/revenue.js";
import type { RevenueRepository } from "../../../domain/repositories/revenue-repository.js";
import type { ContractRepository } from "../../../domain/repositories/contract-repository.js";
import type { GenerateRevenueFromContractCommand } from "../../commands/generate-revenue-from-contract/generate-revenue-from-contract.command.js";

/**
 * GenerateRevenueFromContractHandler — Application Layer, Sales Domain
 * (`ADR-0047`). Composição intra-domínio (Sales→Sales), mesmo padrão de
 * `GenerateContractFromQuotationHandler` (`ADR-0044`) — busca o `Contract`
 * real, exige `status === "active"` (`ConflictError` caso contrário), copia
 * `organizationId` do Contract para o novo `Revenue`. Diferente de Contract,
 * não há bloqueio de "já existe" — múltiplos Revenue podem nascer do mesmo
 * Contract (reconhecimento incremental).
 */
export class GenerateRevenueFromContractHandler {
  constructor(
    private readonly revenueRepository: RevenueRepository,
    private readonly contractRepository: ContractRepository,
  ) {}

  async execute(command: GenerateRevenueFromContractCommand): Promise<Result<Revenue, DomainError | InfrastructureError>> {
    const findResult = await this.contractRepository.findById(new UniqueEntityId(command.contractId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Contract "${command.contractId}" não encontrado`));
    }
    const contract = option.getOrElse(null as never);

    if (contract.status !== "active") {
      return Result.fail(new ConflictError(`Revenue só pode ser gerado a partir de um Contract "active" (atual: "${contract.status}")`));
    }

    const createResult = Revenue.create({
      organizationId: contract.organizationId,
      contractId: contract.id,
      amount: command.amount,
      currency: command.currency,
      recognizedAt: command.recognizedAt,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const revenue = createResult.getValue()!;

    const saveResult = await this.revenueRepository.save(revenue);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(revenue);
  }
}
