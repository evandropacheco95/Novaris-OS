import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Option, Result, type InfrastructureError } from "@novaris/shared-kernel";
import { Product } from "../../../../domain/aggregates/product/product.js";
import type { ProductRepository } from "../../../../domain/repositories/product-repository.js";
import { ActivateProductHandler } from "../../../../application/handlers/activate-product/activate-product.handler.js";
import { ActivateProductCommand } from "../../../../application/commands/activate-product/activate-product.command.js";

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

describe("ActivateProductHandler", () => {
  it("reativa um Product desativado (achado `ENG-0155` — completa o par de `deactivate`)", async () => {
    const repository = new FakeProductRepository();
    const handler = new ActivateProductHandler(repository);

    const product = Product.create({ organizationId: new UniqueEntityId(), name: "Produto", unitPrice: 100 }).getValue()!;
    product.deactivate();
    repository.add(product);

    const result = await handler.execute(new ActivateProductCommand({ productId: product.id.toString() }));
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.active, true);
  });

  it("rejeita ativar um Product já ativo", async () => {
    const repository = new FakeProductRepository();
    const handler = new ActivateProductHandler(repository);

    const product = Product.create({ organizationId: new UniqueEntityId(), name: "Produto", unitPrice: 100 }).getValue()!;
    repository.add(product);

    const result = await handler.execute(new ActivateProductCommand({ productId: product.id.toString() }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });

  it("devolve NotFoundError para productId inexistente", async () => {
    const repository = new FakeProductRepository();
    const handler = new ActivateProductHandler(repository);

    const result = await handler.execute(new ActivateProductCommand({ productId: new UniqueEntityId().toString() }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "NOT_FOUND_ERROR");
  });
});
