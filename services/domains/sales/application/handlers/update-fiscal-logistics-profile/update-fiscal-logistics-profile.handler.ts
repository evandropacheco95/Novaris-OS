import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Product } from "../../../domain/aggregates/product/product.js";
import type { ProductRepository } from "../../../domain/repositories/product-repository.js";
import type { UpdateFiscalLogisticsProfileCommand } from "../../commands/update-fiscal-logistics-profile/update-fiscal-logistics-profile.command.js";

/** UpdateFiscalLogisticsProfileHandler — Application Layer, Sales Domain (`ENG-0166`). */
export class UpdateFiscalLogisticsProfileHandler {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: UpdateFiscalLogisticsProfileCommand): Promise<Result<Product, DomainError | InfrastructureError>> {
    const findResult = await this.productRepository.findById(new UniqueEntityId(command.productId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Product "${command.productId}" não encontrado`));
    }
    const product = option.getOrElse(null as never);

    const updateResult = product.updateFiscalLogisticsProfile({
      ncm: command.ncm,
      cfop: command.cfop,
      unit: command.unit,
      weightKg: command.weightKg,
      lengthCm: command.lengthCm,
      widthCm: command.widthCm,
      heightCm: command.heightCm,
      parentProductId: command.parentProductId === undefined ? undefined : command.parentProductId === null ? null : new UniqueEntityId(command.parentProductId),
      variantLabel: command.variantLabel,
      externalId: command.externalId,
    });
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
