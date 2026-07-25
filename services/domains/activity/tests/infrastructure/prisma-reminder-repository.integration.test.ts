import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Reminder } from "../../domain/aggregates/reminder/reminder.js";
import { PrismaReminderRepository } from "../../infrastructure/repositories/prisma-reminder-repository.js";

describe("PrismaReminderRepository — integração real (Supabase)", () => {
  const repository = new PrismaReminderRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.reminder.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste, dispensa e recupera um Reminder real do Postgres", async () => {
    const reminder = Reminder.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), message: "Ligar amanhã", remindAt: new Date("2026-08-01T09:00:00Z") }).getValue()!;
    createdIds.push(reminder.id.toString());

    const saveResult = await repository.save(reminder);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    let found = (await repository.findById(reminder.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.dismissed, false);

    reminder.dismiss();
    await repository.save(reminder);
    found = (await repository.findById(reminder.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.dismissed, true);
  });

  it("exists()/delete() funcionam contra o banco real", async () => {
    const reminder = Reminder.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), message: "Temporário", remindAt: new Date() }).getValue()!;
    await repository.save(reminder);
    assert.equal((await repository.exists(reminder.id)).getValue(), true);
    await repository.delete(reminder.id);
    assert.equal((await repository.exists(reminder.id)).getValue(), false);
  });
});
