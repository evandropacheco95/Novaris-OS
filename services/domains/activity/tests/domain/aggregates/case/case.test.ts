import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Case } from "../../../../domain/aggregates/case/case.js";

describe("Case.create", () => {
  it("cria um Case válido, status inicial 'new'", () => {
    const result = Case.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "Erro no login", priority: "high" });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.status, "new");
  });

  it("rejeita subject vazio", () => {
    const result = Case.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: " ", priority: "low" });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita priority inválida (achado proativo do bug de enum em runtime)", () => {
    // @ts-expect-error valor fora da união, testando a checagem em runtime
    const result = Case.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "X", priority: "urgent" });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("dispara exatamente um CaseCreated", () => {
    const caseInstance = Case.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "X", priority: "medium" }).getValue()!;
    assert.equal(caseInstance.domainEvents.length, 1);
    assert.equal(caseInstance.domainEvents[0]!.eventName, "CaseCreated");
  });
});

describe("Case.start", () => {
  it("transiciona new → in_progress, sem Domain Event", () => {
    const caseInstance = Case.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "X", priority: "low" }).getValue()!;
    const result = caseInstance.start();
    assert.equal(result.isSuccess, true);
    assert.equal(caseInstance.status, "in_progress");
    assert.equal(caseInstance.domainEvents.length, 1); // só o CaseCreated da criação
  });

  it("rejeita start() a partir de 'closed'", () => {
    const caseInstance = Case.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "X", priority: "low" }).getValue()!;
    caseInstance.close();
    const result = caseInstance.start();
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });
});

describe("Case.close", () => {
  it("fecha diretamente a partir de 'new' (sem passar por in_progress)", () => {
    const caseInstance = Case.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "X", priority: "low" }).getValue()!;
    const result = caseInstance.close();
    assert.equal(result.isSuccess, true);
    assert.equal(caseInstance.status, "closed");
    assert.equal(caseInstance.domainEvents.some((event) => event.eventName === "CaseClosed"), true);
  });

  it("fecha a partir de 'in_progress'", () => {
    const caseInstance = Case.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "X", priority: "low" }).getValue()!;
    caseInstance.start();
    const result = caseInstance.close();
    assert.equal(result.isSuccess, true);
  });

  it("rejeita fechar duas vezes (terminal)", () => {
    const caseInstance = Case.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), subject: "X", priority: "low" }).getValue()!;
    caseInstance.close();
    const result = caseInstance.close();
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });
});
