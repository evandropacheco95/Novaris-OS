import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Checklist } from "../../domain/aggregates/checklist/checklist.js";
import { PrismaChecklistRepository } from "../../infrastructure/repositories/prisma-checklist-repository.js";

describe("PrismaChecklistRepository — integração real (Supabase)", () => {
  const repository = new PrismaChecklistRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.checklistItem.deleteMany({ where: { checklistId: { in: createdIds } } });
    await prisma.checklist.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste itens reais e reconstitui o toggle corretamente", async () => {
    const checklist = Checklist.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), title: "Onboarding real" }).getValue()!;
    createdIds.push(checklist.id.toString());
    await repository.save(checklist);

    const item = checklist.addItem("Enviar contrato").getValue()!;
    checklist.addItem("Agendar kickoff");
    await repository.save(checklist);

    let found = (await repository.findById(checklist.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.getItems().length, 2);
    assert.equal(found.getItems().every((i) => !i.completed), true);

    checklist.toggleItem(item.id);
    await repository.save(checklist);
    found = (await repository.findById(checklist.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.getItems().find((i) => i.id.equals(item.id))!.completed, true);
  });

  it("exists()/delete() funcionam contra o banco real (cascade em checklist_items)", async () => {
    const checklist = Checklist.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), title: "Temporário" }).getValue()!;
    await repository.save(checklist);
    checklist.addItem("Item");
    await repository.save(checklist);

    assert.equal((await repository.exists(checklist.id)).getValue(), true);
    await repository.delete(checklist.id);
    assert.equal((await repository.exists(checklist.id)).getValue(), false);
  });
});
