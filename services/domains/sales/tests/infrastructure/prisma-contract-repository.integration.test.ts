import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Contract } from "../../domain/aggregates/contract/contract.js";
import { PrismaContractRepository } from "../../infrastructure/repositories/prisma-contract-repository.js";

describe("PrismaContractRepository — integração real (Supabase)", () => {
  const repository = new PrismaContractRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.contract.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera um Contract real do Postgres", async () => {
    const contract = Contract.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), quotationId: new UniqueEntityId() }).getValue()!;
    createdIds.push(contract.id.toString());

    const saveResult = await repository.save(contract);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const found = (await repository.findById(contract.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.status, "draft");
    assert.equal(found.opportunityId.equals(contract.opportunityId), true);
    assert.equal(found.quotationId.equals(contract.quotationId), true);
  });

  it("persiste activate()/terminate()", async () => {
    const contract = Contract.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), quotationId: new UniqueEntityId() }).getValue()!;
    createdIds.push(contract.id.toString());
    await repository.save(contract);

    contract.activate();
    await repository.save(contract);
    let found = (await repository.findById(contract.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.status, "active");

    contract.terminate();
    await repository.save(contract);
    found = (await repository.findById(contract.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.status, "terminated");
  });

  it("exists()/delete() funcionam contra o banco real", async () => {
    const contract = Contract.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), quotationId: new UniqueEntityId() }).getValue()!;
    await repository.save(contract);

    assert.equal((await repository.exists(contract.id)).getValue(), true);
    await repository.delete(contract.id);
    assert.equal((await repository.exists(contract.id)).getValue(), false);
  });
});
