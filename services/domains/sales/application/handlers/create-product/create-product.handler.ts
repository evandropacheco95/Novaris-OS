import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Product } from "../../../domain/aggregates/product/product.js";
import type { ProductRepository } from "../../../domain/repositories/product-repository.js";
import type { CreateProductCommand } from "../../commands/create-product/create-product.command.js";

/** CreateProductHandler — Application Layer, Sales Domain (`ADR-0043`). */
export class CreateProductHandler {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: CreateProductCommand): Promise<Result<Product, DomainError | InfrastructureError>> {
    const createResult = Product.create({
      organizationId: new UniqueEntityId(command.organizationId),
      name: command.name,
      sku: command.sku,
      unitPrice: command.unitPrice,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const product = createResult.getValue()!;

    const saveResult = await this.productRepository.save(product);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(product);
  }
}
