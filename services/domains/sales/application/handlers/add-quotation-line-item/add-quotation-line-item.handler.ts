import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Quotation } from "../../../domain/aggregates/quotation/quotation.js";
import type { QuotationRepository } from "../../../domain/repositories/quotation-repository.js";
import type { ProductRepository } from "../../../domain/repositories/product-repository.js";
import type { AddQuotationLineItemCommand } from "../../commands/add-quotation-line-item/add-quotation-line-item.command.js";

/**
 * AddQuotationLineItemHandler — Application Layer, Sales Domain (`ADR-0043`).
 *
 * Injeta `ProductRepository` além de `QuotationRepository` — resolve o
 * `unitPrice` a partir do `Product` real no momento da chamada, nunca aceita
 * preço vindo do cliente HTTP. Falha com `NotFoundError` se o `Product` não
 * existir ou estiver `active: false`. Composição dentro do mesmo domínio
 * (Sales→Sales) — mais simples que `ConvertLeadHandler` (Sales→Customer,
 * `ADR-0042`), mesmo princípio de injeção de dependência.
 */
export class AddQuotationLineItemHandler {
  constructor(
    private readonly quotationRepository: QuotationRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(command: AddQuotationLineItemCommand): Promise<Result<Quotation, DomainError | InfrastructureError>> {
    const findQuotationResult = await this.quotationRepository.findById(new UniqueEntityId(command.quotationId));
    if (findQuotationResult.isFailure) {
      return Result.fail(findQuotationResult.getError()!);
    }
    const quotationOption = findQuotationResult.getValue()!;
    if (quotationOption.isNone) {
      return Result.fail(new NotFoundError(`Quotation "${command.quotationId}" não encontrada`));
    }
    const quotation = quotationOption.getOrElse(null as never);

    const findProductResult = await this.productRepository.findById(new UniqueEntityId(command.productId));
    if (findProductResult.isFailure) {
      return Result.fail(findProductResult.getError()!);
    }
    const productOption = findProductResult.getValue()!;
    if (productOption.isNone) {
      return Result.fail(new NotFoundError(`Product "${command.productId}" não encontrado`));
    }
    const product = productOption.getOrElse(null as never);
    if (!product.active) {
      return Result.fail(new NotFoundError(`Product "${command.productId}" não está ativo`));
    }

    const addResult = quotation.addLineItem({
      productId: product.id,
      quantity: command.quantity,
      unitPrice: product.unitPrice,
    });
    if (addResult.isFailure) {
      return Result.fail(addResult.getError()!);
    }

    const saveResult = await this.quotationRepository.save(quotation);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(quotation);
  }
}
