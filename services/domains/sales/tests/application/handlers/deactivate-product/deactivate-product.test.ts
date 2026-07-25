import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Option, Result, type InfrastructureError } from "@novaris/shared-kernel";
import { Product } from "../../../../domain/aggregates/product/product.js";
import type { ProductRepository } from "../../../../domain/repositories/product-repository.js";
import { DeactivateProductHandler } from "../../../../application/handlers/deactivate-product/deactivate-product.handler.js";
import { DeactivateProductCommand } from "../../../../application/commands/deactivate-product/deactivate-product.command.js";

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

describe("DeactivateProductHandler", () => {
  it("desativa um Product real (achado `ENG-0155` — Domain já existia sem Handler)", async () => {
    const repository = new FakeProductRepository();
    const handler = new DeactivateProductHandler(repository);

    const product = Product.create({ organizationId: new UniqueEntityId(), name: "Produto", unitPrice: 100 }).getValue()!;
    repository.add(product);

    const result = await handler.execute(new DeactivateProductCommand({ productId: product.id.toString() }));
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.active, false);
  });

  it("rejeita desativar um Product já inativo", async () => {
    const repository = new FakeProductRepository();
    const handler = new DeactivateProductHandler(repository);

    const product = Product.create({ organizationId: new UniqueEntityId(), name: "Produto", unitPrice: 100 }).getValue()!;
    product.deactivate();
    repository.add(product);

    const result = await handler.execute(new DeactivateProductCommand({ productId: product.id.toString() }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });

  it("devolve NotFoundError para productId inexistente", async () => {
    const repository = new FakeProductRepository();
    const handler = new DeactivateProductHandler(repository);

    const result = await handler.execute(new DeactivateProductCommand({ productId: new UniqueEntityId().toString() }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "NOT_FOUND_ERROR");
  });
});
