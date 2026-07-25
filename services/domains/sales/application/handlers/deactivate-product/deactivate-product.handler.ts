import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Product } from "../../../domain/aggregates/product/product.js";
import type { ProductRepository } from "../../../domain/repositories/product-repository.js";
import type { DeactivateProductCommand } from "../../commands/deactivate-product/deactivate-product.command.js";

/**
 * DeactivateProductHandler — Application Layer, Sales Domain (`ADR-0043`).
 * Achado real (`ENG-0155`): `Product.deactivate()` já existia no Domain e era
 * testado na Infrastructure desde `ENG-0144`, mas nunca tinha Handler/rota —
 * `active` era sempre `true` em todo Product criado via API, sem forma de
 * mudar isso. Fecha essa lacuna, mesmo padrão de `UpdateProductPriceHandler`.
 */
export class DeactivateProductHandler {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: DeactivateProductCommand): Promise<Result<Product, DomainError | InfrastructureError>> {
    const findResult = await this.productRepository.findById(new UniqueEntityId(command.productId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Product "${command.productId}" não encontrado`));
    }
    const product = option.getOrElse(null as never);

    const deactivateResult = product.deactivate();
    if (deactivateResult.isFailure) {
      return Result.fail(deactivateResult.getError()!);
    }

    const saveResult = await this.productRepository.save(product);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(product);
  }
}
