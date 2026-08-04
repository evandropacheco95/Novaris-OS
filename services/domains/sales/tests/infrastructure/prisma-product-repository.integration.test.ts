import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Product } from "../../domain/aggregates/product/product.js";
import { PrismaProductRepository } from "../../infrastructure/repositories/prisma-product-repository.js";

describe("PrismaProductRepository — integração real (Supabase)", () => {
  const repository = new PrismaProductRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.product.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera um Product real do Postgres", async () => {
    const product = Product.create({ organizationId: new UniqueEntityId(), name: "Consultoria Hora", sku: "CONS-01", unitPrice: 150.5 }).getValue()!;
    createdIds.push(product.id.toString());

    const saveResult = await repository.save(product);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const found = (await repository.findById(product.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.name, "Consultoria Hora");
    assert.equal(found.sku, "CONS-01");
    assert.equal(found.unitPrice, 150.5);
    assert.equal(found.active, true);
  });

  it("persiste updatePrice() e deactivate()", async () => {
    const product = Product.create({ organizationId: new UniqueEntityId(), name: "X", unitPrice: 10 }).getValue()!;
    createdIds.push(product.id.toString());
    await repository.save(product);

    product.updatePrice(99);
    product.deactivate();
    await repository.save(product);

    const found = (await repository.findById(product.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.unitPrice, 99);
    assert.equal(found.active, false);
  });

  it("persiste ncm/cfop/unit/peso/dimensões/variação (ENG-0166) e reflete no re-fetch", async () => {
    const parent = Product.create({ organizationId: new UniqueEntityId(), name: "Camiseta", unitPrice: 49.9 }).getValue()!;
    createdIds.push(parent.id.toString());
    await repository.save(parent);

    const variant = Product.create({
      organizationId: new UniqueEntityId(),
      name: "Camiseta Azul M",
      unitPrice: 49.9,
      ncm: "61091000",
      cfop: "5405",
      unit: "UN",
      weightKg: 0.25,
      lengthCm: 30,
      widthCm: 25,
      heightCm: 2,
      parentProductId: parent.id,
      variantLabel: "Azul - M",
      externalId: "bling-12345",
    }).getValue()!;
    createdIds.push(variant.id.toString());
    await repository.save(variant);

    const found = (await repository.findById(variant.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.ncm, "61091000");
    assert.equal(found.cfop, "5405");
    assert.equal(found.unit, "UN");
    assert.equal(found.weightKg, 0.25);
    assert.equal(found.lengthCm, 30);
    assert.equal(found.widthCm, 25);
    assert.equal(found.heightCm, 2);
    assert.equal(found.parentProductId?.equals(parent.id), true);
    assert.equal(found.variantLabel, "Azul - M");
    assert.equal(found.externalId, "bling-12345");

    found.updateFiscalLogisticsProfile({ ncm: null, weightKg: null });
    await repository.save(found);

    const refetched = (await repository.findById(variant.id)).getValue()!.getOrElse(null as never);
    assert.equal(refetched.ncm, undefined, "null deve remover o valor (undefined = sem perfil fiscal)");
    assert.equal(refetched.weightKg, undefined);
    assert.equal(refetched.cfop, "5405", "campo não tocado não deveria mudar");
  });

  it("exists()/delete() funcionam contra o banco real", async () => {
    const product = Product.create({ organizationId: new UniqueEntityId(), name: "Temporário", unitPrice: 1 }).getValue()!;
    await repository.save(product);

    assert.equal((await repository.exists(product.id)).getValue(), true);
    await repository.delete(product.id);
    assert.equal((await repository.exists(product.id)).getValue(), false);
  });
});
