import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Product } from "../../../../domain/aggregates/product/product.js";

describe("Product.create", () => {
  it("cria um Product válido, ativo por padrão", () => {
    const result = Product.create({ organizationId: new UniqueEntityId(), name: "Consultoria Hora", unitPrice: 150 });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.active, true);
  });

  it("aceita sku opcional", () => {
    const result = Product.create({ organizationId: new UniqueEntityId(), name: "Licença Anual", sku: "LIC-001", unitPrice: 1200 });
    assert.equal(result.getValue()!.sku, "LIC-001");
  });

  it("rejeita name vazio", () => {
    const result = Product.create({ organizationId: new UniqueEntityId(), name: "  ", unitPrice: 10 });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita unitPrice negativo", () => {
    const result = Product.create({ organizationId: new UniqueEntityId(), name: "X", unitPrice: -1 });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("sem Domain Events (mesmo critério de Party/Campaign/Dashboard)", () => {
    const product = Product.create({ organizationId: new UniqueEntityId(), name: "X", unitPrice: 10 }).getValue()!;
    assert.equal(product.domainEvents.length, 0);
  });
});

describe("Product.updatePrice", () => {
  it("atualiza o preço", () => {
    const product = Product.create({ organizationId: new UniqueEntityId(), name: "X", unitPrice: 10 }).getValue()!;
    const result = product.updatePrice(20);
    assert.equal(result.isSuccess, true);
    assert.equal(product.unitPrice, 20);
  });

  it("rejeita preço negativo", () => {
    const product = Product.create({ organizationId: new UniqueEntityId(), name: "X", unitPrice: 10 }).getValue()!;
    const result = product.updatePrice(-5);
    assert.equal(result.isFailure, true);
    assert.equal(product.unitPrice, 10);
  });
});

describe("Product.deactivate/activate", () => {
  it("desativa e reativa", () => {
    const product = Product.create({ organizationId: new UniqueEntityId(), name: "X", unitPrice: 10 }).getValue()!;
    assert.equal(product.deactivate().isSuccess, true);
    assert.equal(product.active, false);
    assert.equal(product.activate().isSuccess, true);
    assert.equal(product.active, true);
  });

  it("rejeita desativar duas vezes", () => {
    const product = Product.create({ organizationId: new UniqueEntityId(), name: "X", unitPrice: 10 }).getValue()!;
    product.deactivate();
    const result = product.deactivate();
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });
});
