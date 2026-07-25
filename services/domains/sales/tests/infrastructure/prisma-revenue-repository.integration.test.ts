import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Revenue } from "../../domain/aggregates/revenue/revenue.js";
import { PrismaRevenueRepository } from "../../infrastructure/repositories/prisma-revenue-repository.js";

describe("PrismaRevenueRepository — integração real (Supabase)", () => {
  const repository = new PrismaRevenueRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.revenue.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera um Revenue real do Postgres", async () => {
    const contractId = new UniqueEntityId();
    const recognizedAt = new Date("2026-02-01T00:00:00.000Z");
    const revenue = Revenue.create({ organizationId: new UniqueEntityId(), contractId, amount: 1234.56, currency: "BRL", recognizedAt }).getValue()!;
    createdIds.push(revenue.id.toString());

    const saveResult = await repository.save(revenue);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const found = (await repository.findById(revenue.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.amount, 1234.56);
    assert.equal(found.currency, "BRL");
    assert.equal(found.contractId.equals(contractId), true);
    assert.equal(found.recognizedAt.getTime(), recognizedAt.getTime());
  });

  it("exists()/delete() funcionam contra o banco real", async () => {
    const revenue = Revenue.create({ organizationId: new UniqueEntityId(), contractId: new UniqueEntityId(), amount: 100, currency: "BRL" }).getValue()!;
    await repository.save(revenue);

    assert.equal((await repository.exists(revenue.id)).getValue(), true);
    await repository.delete(revenue.id);
    assert.equal((await repository.exists(revenue.id)).getValue(), false);
  });
});
