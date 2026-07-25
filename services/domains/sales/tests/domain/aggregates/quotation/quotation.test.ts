import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Quotation } from "../../../../domain/aggregates/quotation/quotation.js";

describe("Quotation.create", () => {
  it("cria uma Quotation válida, status inicial 'draft', sem itens", () => {
    const result = Quotation.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId() });
    assert.equal(result.isSuccess, true);
    const quotation = result.getValue()!;
    assert.equal(quotation.status, "draft");
    assert.equal(quotation.getLineItems().length, 0);
    assert.equal(quotation.total, 0);
  });

  it("dispara exatamente um QuotationCreated", () => {
    const quotation = Quotation.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId() }).getValue()!;
    assert.equal(quotation.domainEvents.length, 1);
    assert.equal(quotation.domainEvents[0]!.eventName, "QuotationCreated");
  });
});

describe("Quotation.addLineItem", () => {
  it("adiciona um item e computa o total", () => {
    const quotation = Quotation.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId() }).getValue()!;
    const result = quotation.addLineItem({ productId: new UniqueEntityId(), quantity: 3, unitPrice: 100 });
    assert.equal(result.isSuccess, true);
    assert.equal(quotation.getLineItems().length, 1);
    assert.equal(quotation.total, 300);
  });

  it("soma múltiplos itens", () => {
    const quotation = Quotation.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId() }).getValue()!;
    quotation.addLineItem({ productId: new UniqueEntityId(), quantity: 2, unitPrice: 50 });
    quotation.addLineItem({ productId: new UniqueEntityId(), quantity: 1, unitPrice: 30 });
    assert.equal(quotation.total, 130);
  });

  it("rejeita quantity <= 0", () => {
    const quotation = Quotation.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId() }).getValue()!;
    const result = quotation.addLineItem({ productId: new UniqueEntityId(), quantity: 0, unitPrice: 10 });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita adicionar item fora de 'draft'", () => {
    const quotation = Quotation.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId() }).getValue()!;
    quotation.send();
    const result = quotation.addLineItem({ productId: new UniqueEntityId(), quantity: 1, unitPrice: 10 });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });
});

describe("Quotation.send/accept/reject", () => {
  it("transiciona draft → sent → accepted, disparando QuotationAccepted", () => {
    const quotation = Quotation.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId() }).getValue()!;
    assert.equal(quotation.send().isSuccess, true);
    assert.equal(quotation.status, "sent");
    assert.equal(quotation.accept().isSuccess, true);
    assert.equal(quotation.status, "accepted");
    assert.equal(quotation.domainEvents.some((event) => event.eventName === "QuotationAccepted"), true);
  });

  it("transiciona draft → sent → rejected, disparando QuotationRejected", () => {
    const quotation = Quotation.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId() }).getValue()!;
    quotation.send();
    assert.equal(quotation.reject().isSuccess, true);
    assert.equal(quotation.status, "rejected");
    assert.equal(quotation.domainEvents.some((event) => event.eventName === "QuotationRejected"), true);
  });

  it("rejeita accept() sem antes enviar", () => {
    const quotation = Quotation.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId() }).getValue()!;
    const result = quotation.accept();
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });

  it("rejeita accept() duas vezes (terminal)", () => {
    const quotation = Quotation.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId() }).getValue()!;
    quotation.send();
    quotation.accept();
    const result = quotation.accept();
    assert.equal(result.isFailure, true);
  });
});

describe("Quotation.reconstitute", () => {
  it("recria com itens já existentes, sem disparar eventos", () => {
    const id = new UniqueEntityId();
    const now = new Date();
    const quotation = Quotation.reconstitute(
      { organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), status: "draft", createdAt: now, updatedAt: now },
      id,
      [],
    );
    assert.equal(quotation.id.equals(id), true);
    assert.equal(quotation.domainEvents.length, 0);
  });
});
