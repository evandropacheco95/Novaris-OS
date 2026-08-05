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

describe("Contract.updateFiscalDocument", () => {
  function createContract() {
    return Contract.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), quotationId: new UniqueEntityId() }).getValue()!;
  }

  it("atribui número, chave de acesso (44 dígitos) e data de emissão", () => {
    const contract = createContract();
    const issuedAt = new Date("2026-08-01T00:00:00Z");
    const result = contract.updateFiscalDocument({
      fiscalDocumentNumber: "123456",
      fiscalDocumentAccessKey: "1".repeat(44),
      fiscalDocumentIssuedAt: issuedAt,
    });
    assert.equal(result.isSuccess, true);
    assert.equal(contract.fiscalDocumentNumber, "123456");
    assert.equal(contract.fiscalDocumentAccessKey, "1".repeat(44));
    assert.equal(contract.fiscalDocumentIssuedAt?.getTime(), issuedAt.getTime());
  });

  it("rejeita chave de acesso com tamanho diferente de 44 dígitos", () => {
    const contract = createContract();
    const result = contract.updateFiscalDocument({ fiscalDocumentAccessKey: "123" });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
    assert.equal(contract.fiscalDocumentAccessKey, undefined);
  });

  it("undefined não mexe em campo já preenchido; null remove explicitamente", () => {
    const contract = createContract();
    contract.updateFiscalDocument({ fiscalDocumentNumber: "111", fiscalDocumentAccessKey: "2".repeat(44) });

    contract.updateFiscalDocument({ fiscalDocumentAccessKey: undefined });
    assert.equal(contract.fiscalDocumentAccessKey, "2".repeat(44), "undefined não deve remover o valor existente");

    contract.updateFiscalDocument({ fiscalDocumentNumber: null });
    assert.equal(contract.fiscalDocumentNumber, undefined, "null deve remover o valor explicitamente");
  });

  it("não dispara Domain Event (mesmo critério de Product.updateFiscalLogisticsProfile)", () => {
    const contract = createContract();
    contract.updateFiscalDocument({ fiscalDocumentNumber: "123456" });
    assert.equal(contract.domainEvents.length, 1, "só o ContractCreated original");
  });
});
