import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Reminder } from "../../../../domain/aggregates/reminder/reminder.js";

describe("Reminder.create", () => {
  it("cria um Reminder válido, dismissed: false", () => {
    const result = Reminder.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), message: "Ligar amanhã", remindAt: new Date() });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.dismissed, false);
  });

  it("rejeita message vazia", () => {
    const result = Reminder.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), message: " ", remindAt: new Date() });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("sem Domain Events — nenhuma fonte confirma um", () => {
    const reminder = Reminder.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), message: "X", remindAt: new Date() }).getValue()!;
    assert.equal(reminder.domainEvents.length, 0);
  });
});

describe("Reminder.dismiss", () => {
  it("transiciona false → true", () => {
    const reminder = Reminder.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), message: "X", remindAt: new Date() }).getValue()!;
    const result = reminder.dismiss();
    assert.equal(result.isSuccess, true);
    assert.equal(reminder.dismissed, true);
  });

  it("rejeita dismiss() duas vezes (terminal)", () => {
    const reminder = Reminder.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), message: "X", remindAt: new Date() }).getValue()!;
    reminder.dismiss();
    const result = reminder.dismiss();
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });
});
