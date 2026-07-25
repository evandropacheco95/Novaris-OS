import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Product } from "../../../domain/aggregates/product/product.js";
import type { ProductRepository } from "../../../domain/repositories/product-repository.js";
import type { UpdateProductPriceCommand } from "../../commands/update-product-price/update-product-price.command.js";

/** UpdateProductPriceHandler — Application Layer, Sales Domain (`ADR-0043`). */
export class UpdateProductPriceHandler {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: UpdateProductPriceCommand): Promise<Result<Product, DomainError | InfrastructureError>> {
    const findResult = await this.productRepository.findById(new UniqueEntityId(command.productId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Product "${command.productId}" não encontrado`));
    }
    const product = option.getOrElse(null as never);

    const updateResult = product.updatePrice(command.unitPrice);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError()!);
    }

    const saveResult = await this.productRepository.save(product);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(product);
  }
}
