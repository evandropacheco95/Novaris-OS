import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Case } from "../../domain/aggregates/case/case.js";
import { PrismaCaseRepository } from "../../infrastructure/repositories/prisma-case-repository.js";

describe("PrismaCaseRepository — integração real (Supabase)", () => {
  const repository = new PrismaCaseRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.case.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera um Case real do Postgres", async () => {
    const caseInstance = Case.create({
      organizationId: new UniqueEntityId(),
      partyId: new UniqueEntityId(),
      subject: "Erro ao emitir nota fiscal",
      description: "Cliente relatou erro 500 ao tentar emitir NF-e",
      priority: "high",
    }).getValue()!;
    createdIds.push(caseInstance.id.toString());

    const saveResult = await repository.save(caseInstance);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const found = (await repository.findById(caseInstance.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.subject, "Erro ao emitir nota fiscal");
    assert.equal(found.priority, "high");
    assert.equal(found.status, "new");
  });

  it("persiste start()/close()", async () => {
    const caseInstance = Case.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "X", priority: "low" }).getValue()!;
    createdIds.push(caseInstance.id.toString());
    await repository.save(caseInstance);

    caseInstance.start();
    await repository.save(caseInstance);
    let found = (await repository.findById(caseInstance.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.status, "in_progress");

    caseInstance.close();
    await repository.save(caseInstance);
    found = (await repository.findById(caseInstance.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.status, "closed");
  });

  it("exists()/delete() funcionam contra o banco real", async () => {
    const caseInstance = Case.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "Temporário", priority: "low" }).getValue()!;
    await repository.save(caseInstance);

    assert.equal((await repository.exists(caseInstance.id)).getValue(), true);
    await repository.delete(caseInstance.id);
    assert.equal((await repository.exists(caseInstance.id)).getValue(), false);
  });
});
