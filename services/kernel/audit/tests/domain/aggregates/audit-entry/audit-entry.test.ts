import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, ValidationError } from "@novaris/shared-kernel";
import { AuditEntry } from "../../../../src/domain/aggregates/audit-entry/audit-entry.js";

function buildCreateInput() {
  return {
    actorId: new UniqueEntityId(),
    organizationId: new UniqueEntityId(),
    targetId: new UniqueEntityId(),
    targetType: "Organization",
    action: "OrganizationCreated",
    occurredAt: new Date(),
    origin: "192.0.2.10",
  };
}

describe("AuditEntry.create", () => {
  it("cria um AuditEntry válido", () => {
    const input = buildCreateInput();
    const result = AuditEntry.create(input);
    assert.equal(result.isSuccess, true);
    const entry = result.getValue()!;
    assert.equal(entry.actorId.equals(input.actorId), true);
    assert.equal(entry.organizationId.equals(input.organizationId), true);
    assert.equal(entry.targetId.equals(input.targetId), true);
    assert.equal(entry.targetType, "Organization");
    assert.equal(entry.action, "OrganizationCreated");
    assert.equal(entry.occurredAt, input.occurredAt);
    assert.equal(entry.origin, "192.0.2.10");
    assert.equal(entry.changeSet, undefined);
  });

  it("aceita changeSet explícito quando fornecido", () => {
    const input = { ...buildCreateInput(), changeSet: { before: { status: "trial" }, after: { status: "active" } } };
    const entry = AuditEntry.create(input).getValue()!;
    assert.deepEqual(entry.changeSet, { before: { status: "trial" }, after: { status: "active" } });
  });

  it("rejeita targetType vazio", () => {
    const result = AuditEntry.create({ ...buildCreateInput(), targetType: "   " });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("rejeita action vazio", () => {
    const result = AuditEntry.create({ ...buildCreateInput(), action: "" });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("rejeita origin vazio", () => {
    const result = AuditEntry.create({ ...buildCreateInput(), origin: "" });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => AuditEntry.create({ ...buildCreateInput(), targetType: "" }));
  });

  it("não dispara nenhum Domain Event — nenhum foi aprovado para AuditEntry", () => {
    const entry = AuditEntry.create(buildCreateInput()).getValue()!;
    assert.equal(entry.domainEvents.length, 0);
  });
});

describe("AuditEntry.reconstitute", () => {
  it("recria um AuditEntry sem validar e sem disparar eventos", () => {
    const id = new UniqueEntityId();
    const props = {
      actorId: new UniqueEntityId(),
      organizationId: new UniqueEntityId(),
      targetId: new UniqueEntityId(),
      targetType: "",
      action: "",
      occurredAt: new Date(),
      origin: "",
    };
    const reconstituted = AuditEntry.reconstitute(props, id);
    assert.equal(reconstituted.id.equals(id), true);
    assert.equal(reconstituted.targetType, "");
    assert.equal(reconstituted.domainEvents.length, 0);
  });
});

describe("AuditEntry — imutabilidade", () => {
  it("id permanece o mesmo após a criação", () => {
    const entry = AuditEntry.create(buildCreateInput()).getValue()!;
    const idBefore = entry.id;
    assert.equal(entry.id, idBefore);
  });

  it("não expõe nenhum método de mutação — apenas getters e os dois Factory Methods estáticos", () => {
    const entry = AuditEntry.create(buildCreateInput()).getValue()!;
    const proto = Object.getPrototypeOf(entry);
    const ownNames = Object.getOwnPropertyNames(proto).filter((name) => name !== "constructor");

    assert.ok(ownNames.length > 0, "esperava ao menos um getter definido em AuditEntry.prototype");

    for (const name of ownNames) {
      const descriptor = Object.getOwnPropertyDescriptor(proto, name);
      assert.equal(typeof descriptor?.get, "function", `"${name}" deveria ser um getter, não um método de mutação`);
      assert.equal(descriptor?.set, undefined, `"${name}" não deveria ter um setter`);
    }
  });
});
