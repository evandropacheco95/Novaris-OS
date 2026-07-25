import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Contract } from "../../../../domain/aggregates/contract/contract.js";

describe("Contract.create", () => {
  it("cria um Contract válido, status inicial 'draft'", () => {
    const result = Contract.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), quotationId: new UniqueEntityId() });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.status, "draft");
  });

  it("dispara exatamente um ContractCreated", () => {
    const contract = Contract.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), quotationId: new UniqueEntityId() }).getValue()!;
    assert.equal(contract.domainEvents.length, 1);
    assert.equal(contract.domainEvents[0]!.eventName, "ContractCreated");
  });
});

describe("Contract.activate", () => {
  it("transiciona draft → active, disparando ContractActivated", () => {
    const contract = Contract.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), quotationId: new UniqueEntityId() }).getValue()!;
    const result = contract.activate();
    assert.equal(result.isSuccess, true);
    assert.equal(contract.status, "active");
    assert.equal(contract.domainEvents.some((event) => event.eventName === "ContractActivated"), true);
  });

  it("rejeita ativar duas vezes", () => {
    const contract = Contract.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), quotationId: new UniqueEntityId() }).getValue()!;
    contract.activate();
    const result = contract.activate();
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });
});

describe("Contract.terminate", () => {
  it("transiciona active → terminated, disparando ContractTerminated", () => {
    const contract = Contract.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), quotationId: new UniqueEntityId() }).getValue()!;
    contract.activate();
    const result = contract.terminate();
    assert.equal(result.isSuccess, true);
    assert.equal(contract.status, "terminated");
    assert.equal(contract.domainEvents.some((event) => event.eventName === "ContractTerminated"), true);
  });

  it("rejeita terminate() sem antes ativar", () => {
    const contract = Contract.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), quotationId: new UniqueEntityId() }).getValue()!;
    const result = contract.terminate();
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });

  it("rejeita terminate() duas vezes (terminal, sem reactivate)", () => {
    const contract = Contract.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), quotationId: new UniqueEntityId() }).getValue()!;
    contract.activate();
    contract.terminate();
    const result = contract.terminate();
    assert.equal(result.isFailure, true);
  });
});
