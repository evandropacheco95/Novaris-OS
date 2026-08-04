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

describe("Product.create — perfil fiscal-logístico (ENG-0166)", () => {
  it("aceita todos os campos ausentes — sem efeito em Product de serviço/software", () => {
    const product = Product.create({ organizationId: new UniqueEntityId(), name: "Consultoria Hora", unitPrice: 150 }).getValue()!;
    assert.equal(product.ncm, undefined);
    assert.equal(product.cfop, undefined);
    assert.equal(product.weightKg, undefined);
    assert.equal(product.parentProductId, undefined);
  });

  it("aceita ncm/cfop válidos (8 e 4 dígitos) e peso/dimensões", () => {
    const product = Product.create({
      organizationId: new UniqueEntityId(),
      name: "Parafuso Sextavado M8",
      unitPrice: 0.5,
      ncm: "73181500",
      cfop: "5405",
      unit: "CX",
      weightKg: 2.5,
      lengthCm: 30,
      widthCm: 20,
      heightCm: 10,
    }).getValue()!;
    assert.equal(product.ncm, "73181500");
    assert.equal(product.cfop, "5405");
    assert.equal(product.unit, "CX");
    assert.equal(product.weightKg, 2.5);
    assert.equal(product.lengthCm, 30);
    assert.equal(product.widthCm, 20);
    assert.equal(product.heightCm, 10);
  });

  it("rejeita ncm com tamanho diferente de 8 dígitos", () => {
    const result = Product.create({ organizationId: new UniqueEntityId(), name: "X", unitPrice: 10, ncm: "123" });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita cfop com tamanho diferente de 4 dígitos", () => {
    const result = Product.create({ organizationId: new UniqueEntityId(), name: "X", unitPrice: 10, cfop: "12345" });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita peso/dimensão negativos", () => {
    assert.equal(Product.create({ organizationId: new UniqueEntityId(), name: "X", unitPrice: 10, weightKg: -1 }).isFailure, true);
    assert.equal(Product.create({ organizationId: new UniqueEntityId(), name: "X", unitPrice: 10, lengthCm: -1 }).isFailure, true);
  });

  it("aceita variantLabel + parentProductId (variação de um Product pai)", () => {
    const parentId = new UniqueEntityId();
    const product = Product.create({
      organizationId: new UniqueEntityId(),
      name: "Camiseta Azul M",
      unitPrice: 49.9,
      variantLabel: "Azul - M",
      parentProductId: parentId,
    }).getValue()!;
    assert.equal(product.variantLabel, "Azul - M");
    assert.equal(product.parentProductId?.equals(parentId), true);
  });
});

describe("Product.updateFiscalLogisticsProfile (ENG-0166)", () => {
  it("atualiza só os campos fornecidos, preservando os demais", () => {
    const product = Product.create({ organizationId: new UniqueEntityId(), name: "X", unitPrice: 10, ncm: "73181500" }).getValue()!;
    product.updateFiscalLogisticsProfile({ weightKg: 3 });
    assert.equal(product.ncm, "73181500");
    assert.equal(product.weightKg, 3);
  });

  it("null remove o valor explicitamente (distinto de undefined = não mexer)", () => {
    const product = Product.create({ organizationId: new UniqueEntityId(), name: "X", unitPrice: 10, ncm: "73181500", weightKg: 3 }).getValue()!;
    const result = product.updateFiscalLogisticsProfile({ ncm: null });
    assert.equal(result.isSuccess, true);
    assert.equal(product.ncm, undefined);
    assert.equal(product.weightKg, 3, "campo não tocado não deveria mudar");
  });

  it("rejeita definir o próprio Product como seu pai", () => {
    const product = Product.create({ organizationId: new UniqueEntityId(), name: "X", unitPrice: 10 }).getValue()!;
    const result = product.updateFiscalLogisticsProfile({ parentProductId: product.id });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita ncm/cfop inválidos na atualização, mesma validação da criação", () => {
    const product = Product.create({ organizationId: new UniqueEntityId(), name: "X", unitPrice: 10 }).getValue()!;
    assert.equal(product.updateFiscalLogisticsProfile({ ncm: "abc" }).isFailure, true);
    assert.equal(product.updateFiscalLogisticsProfile({ cfop: "1" }).isFailure, true);
  });

  it("atualiza updatedAt em caso de sucesso", () => {
    const product = Product.create({ organizationId: new UniqueEntityId(), name: "X", unitPrice: 10 }).getValue()!;
    const firstUpdatedAt = product.updatedAt;
    product.updateFiscalLogisticsProfile({ weightKg: 1 });
    assert.equal(product.updatedAt.getTime() >= firstUpdatedAt.getTime(), true);
  });
});
