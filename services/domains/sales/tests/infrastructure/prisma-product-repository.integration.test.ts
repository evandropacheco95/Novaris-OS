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

  it("exists()/delete() funcionam contra o banco real", async () => {
    const product = Product.create({ organizationId: new UniqueEntityId(), name: "Temporário", unitPrice: 1 }).getValue()!;
    await repository.save(product);

    assert.equal((await repository.exists(product.id)).getValue(), true);
    await repository.delete(product.id);
    assert.equal((await repository.exists(product.id)).getValue(), false);
  });
});
