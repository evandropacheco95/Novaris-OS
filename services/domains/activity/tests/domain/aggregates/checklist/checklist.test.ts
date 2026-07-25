import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Checklist } from "../../../../domain/aggregates/checklist/checklist.js";

describe("Checklist.create", () => {
  it("cria um Checklist válido, sem itens", () => {
    const result = Checklist.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), title: "Onboarding" });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.getItems().length, 0);
  });

  it("rejeita title vazio", () => {
    const result = Checklist.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), title: " " });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("sem Domain Events — nenhuma fonte confirma um", () => {
    const checklist = Checklist.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), title: "X" }).getValue()!;
    assert.equal(checklist.domainEvents.length, 0);
  });
});

describe("Checklist.addItem/toggleItem", () => {
  it("adiciona um item, nasce não-completado", () => {
    const checklist = Checklist.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), title: "X" }).getValue()!;
    const result = checklist.addItem("Enviar contrato");
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.completed, false);
    assert.equal(checklist.getItems().length, 1);
  });

  it("rejeita label vazio", () => {
    const checklist = Checklist.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), title: "X" }).getValue()!;
    const result = checklist.addItem(" ");
    assert.equal(result.isFailure, true);
  });

  it("toggleItem alterna completed", () => {
    const checklist = Checklist.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), title: "X" }).getValue()!;
    const item = checklist.addItem("Item 1").getValue()!;
    checklist.toggleItem(item.id);
    assert.equal(checklist.getItems()[0]!.completed, true);
    checklist.toggleItem(item.id);
    assert.equal(checklist.getItems()[0]!.completed, false);
  });

  it("devolve NotFoundError para itemId inexistente", () => {
    const checklist = Checklist.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), title: "X" }).getValue()!;
    const result = checklist.toggleItem(new UniqueEntityId());
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "NOT_FOUND_ERROR");
  });
});
