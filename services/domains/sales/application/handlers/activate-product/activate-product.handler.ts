import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Product } from "../../../domain/aggregates/product/product.js";
import type { ProductRepository } from "../../../domain/repositories/product-repository.js";
import type { ActivateProductCommand } from "../../commands/activate-product/activate-product.command.js";

/**
 * ActivateProductHandler — Application Layer, Sales Domain (`ADR-0043`).
 * Achado real (`ENG-0155`): `Product.activate()` já existia no Domain junto
 * com `deactivate()`, mas nunca teve Handler/rota — sem isso, "Desativar" na
 * UI seria um beco sem saída (nenhuma forma de reverter). Mesmo padrão de
 * `DeactivateProductHandler`.
 */
export class ActivateProductHandler {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: ActivateProductCommand): Promise<Result<Product, DomainError | InfrastructureError>> {
    const findResult = await this.productRepository.findById(new UniqueEntityId(command.productId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Product "${command.productId}" não encontrado`));
    }
    const product = option.getOrElse(null as never);

    const activateResult = product.activate();
    if (activateResult.isFailure) {
      return Result.fail(activateResult.getError()!);
    }

    const saveResult = await this.productRepository.save(product);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(product);
  }
}
