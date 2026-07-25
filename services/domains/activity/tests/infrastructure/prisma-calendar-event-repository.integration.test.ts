import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { CalendarEvent } from "../../domain/aggregates/calendar-event/calendar-event.js";
import { PrismaCalendarEventRepository } from "../../infrastructure/repositories/prisma-calendar-event-repository.js";

describe("PrismaCalendarEventRepository — integração real (Supabase)", () => {
  const repository = new PrismaCalendarEventRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.calendarEvent.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste, reagenda e recupera um CalendarEvent real do Postgres", async () => {
    const start = new Date("2026-08-01T10:00:00Z");
    const end = new Date("2026-08-01T11:00:00Z");
    const event = CalendarEvent.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "Reunião real", startAt: start, endAt: end, location: "Sala 1" }).getValue()!;
    createdIds.push(event.id.toString());

    const saveResult = await repository.save(event);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    let found = (await repository.findById(event.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.subject, "Reunião real");
    assert.equal(found.location, "Sala 1");

    event.reschedule(new Date("2026-08-02T10:00:00Z"), new Date("2026-08-02T11:00:00Z"));
    await repository.save(event);
    found = (await repository.findById(event.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.startAt.toISOString(), "2026-08-02T10:00:00.000Z");
  });

  it("exists()/delete() funcionam contra o banco real", async () => {
    const start = new Date();
    const event = CalendarEvent.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "Temporário", startAt: start, endAt: start }).getValue()!;
    await repository.save(event);
    assert.equal((await repository.exists(event.id)).getValue(), true);
    await repository.delete(event.id);
    assert.equal((await repository.exists(event.id)).getValue(), false);
  });
});
