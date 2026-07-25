import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { CalendarEvent } from "../../../../domain/aggregates/calendar-event/calendar-event.js";

describe("CalendarEvent.create", () => {
  it("cria um CalendarEvent válido", () => {
    const start = new Date("2026-08-01T10:00:00Z");
    const end = new Date("2026-08-01T11:00:00Z");
    const result = CalendarEvent.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "Reunião", startAt: start, endAt: end });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.subject, "Reunião");
  });

  it("rejeita subject vazio", () => {
    const start = new Date();
    const result = CalendarEvent.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: " ", startAt: start, endAt: start });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita endAt anterior a startAt", () => {
    const start = new Date("2026-08-01T11:00:00Z");
    const end = new Date("2026-08-01T10:00:00Z");
    const result = CalendarEvent.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "X", startAt: start, endAt: end });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("sem Domain Events — nenhuma fonte confirma um", () => {
    const start = new Date();
    const event = CalendarEvent.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "X", startAt: start, endAt: start }).getValue()!;
    assert.equal(event.domainEvents.length, 0);
  });
});

describe("CalendarEvent.reschedule", () => {
  it("atualiza startAt/endAt", () => {
    const start = new Date("2026-08-01T10:00:00Z");
    const end = new Date("2026-08-01T11:00:00Z");
    const event = CalendarEvent.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "X", startAt: start, endAt: end }).getValue()!;
    const newStart = new Date("2026-08-02T10:00:00Z");
    const newEnd = new Date("2026-08-02T11:00:00Z");
    const result = event.reschedule(newStart, newEnd);
    assert.equal(result.isSuccess, true);
    assert.equal(event.startAt.getTime(), newStart.getTime());
  });

  it("rejeita reschedule com endAt anterior a startAt", () => {
    const start = new Date("2026-08-01T10:00:00Z");
    const event = CalendarEvent.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "X", startAt: start, endAt: start }).getValue()!;
    const result = event.reschedule(new Date("2026-08-02T12:00:00Z"), new Date("2026-08-02T10:00:00Z"));
    assert.equal(result.isFailure, true);
  });
});
