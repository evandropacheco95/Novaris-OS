import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Option, Result, type InfrastructureError } from "@novaris/shared-kernel";
import { Product } from "../../../../domain/aggregates/product/product.js";
import type { ProductRepository } from "../../../../domain/repositories/product-repository.js";
import { UpdateFiscalLogisticsProfileHandler } from "../../../../application/handlers/update-fiscal-logistics-profile/update-fiscal-logistics-profile.handler.js";
import { UpdateFiscalLogisticsProfileCommand } from "../../../../application/commands/update-fiscal-logistics-profile/update-fiscal-logistics-profile.command.js";

class FakeProductRepository implements ProductRepository {
  constructor(private readonly products: Map<string, Product> = new Map()) {}
  add(product: Product): void {
    this.products.set(product.id.toString(), product);
  }
  async findById(id: UniqueEntityId): Promise<Result<Option<Product>, InfrastructureError>> {
    const found = this.products.get(id.toString());
    return Result.ok(found ? Option.some(found) : Option.none<Product>());
  }
  async findAll(): Promise<Result<Product[], InfrastructureError>> {
    return Result.ok([...this.products.values()]);
  }
  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.products.has(id.toString()));
  }
  async save(entity: Product): Promise<Result<void, InfrastructureError>> {
    this.products.set(entity.id.toString(), entity);
    return Result.ok(undefined);
  }
  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.products.delete(id.toString());
    return Result.ok(undefined);
  }
}

describe("UpdateFiscalLogisticsProfileHandler (ENG-0166)", () => {
  it("atualiza o perfil fiscal-logístico de um Product existente", async () => {
    const repository = new FakeProductRepository();
    const handler = new UpdateFiscalLogisticsProfileHandler(repository);

    const product = Product.create({ organizationId: new UniqueEntityId(), name: "Parafuso", unitPrice: 0.5 }).getValue()!;
    repository.add(product);

    const result = await handler.execute(
      new UpdateFiscalLogisticsProfileCommand({ productId: product.id.toString(), ncm: "73181500", weightKg: 0.02 }),
    );
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.ncm, "73181500");
    assert.equal(result.getValue()!.weightKg, 0.02);
  });

  it("persiste via save() após atualizar", async () => {
    const repository = new FakeProductRepository();
    const handler = new UpdateFiscalLogisticsProfileHandler(repository);

    const product = Product.create({ organizationId: new UniqueEntityId(), name: "Parafuso", unitPrice: 0.5 }).getValue()!;
    repository.add(product);

    await handler.execute(new UpdateFiscalLogisticsProfileCommand({ productId: product.id.toString(), cfop: "5405" }));

    const refetched = (await repository.findById(product.id)).getValue()!.getOrElse(null as never);
    assert.equal(refetched.cfop, "5405");
  });

  it("devolve NotFoundError para productId inexistente", async () => {
    const repository = new FakeProductRepository();
    const handler = new UpdateFiscalLogisticsProfileHandler(repository);

    const result = await handler.execute(new UpdateFiscalLogisticsProfileCommand({ productId: new UniqueEntityId().toString(), ncm: "73181500" }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "NOT_FOUND_ERROR");
  });

  it("propaga falha de validação do Aggregate (ex.: ncm inválido)", async () => {
    const repository = new FakeProductRepository();
    const handler = new UpdateFiscalLogisticsProfileHandler(repository);

    const product = Product.create({ organizationId: new UniqueEntityId(), name: "Parafuso", unitPrice: 0.5 }).getValue()!;
    repository.add(product);

    const result = await handler.execute(new UpdateFiscalLogisticsProfileCommand({ productId: product.id.toString(), ncm: "123" }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });
});
