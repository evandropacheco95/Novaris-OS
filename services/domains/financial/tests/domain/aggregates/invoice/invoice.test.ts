import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Invoice } from "../../../../domain/aggregates/invoice/invoice.js";
import { InvoicePaid } from "../../../../domain/events/invoice-paid.js";

function buildCreateInput(overrides: Partial<Parameters<typeof Invoice.create>[0]> = {}) {
  return {
    organizationId: new UniqueEntityId(),
    amount: 100,
    currency: "BRL",
    ...overrides,
  };
}

describe("Invoice.create", () => {
  it("cria uma Invoice válida no status \"pending\"", () => {
    const input = buildCreateInput();
    const result = Invoice.create(input);
    assert.equal(result.isSuccess, true);

    const invoice = result.getValue()!;
    assert.equal(invoice.organizationId.equals(input.organizationId), true);
    assert.equal(invoice.amount, 100);
    assert.equal(invoice.currency, "BRL");
    assert.equal(invoice.status, "pending");
    assert.equal(invoice.subscriptionId, undefined);
  });

  it("aceita subscriptionId opcional", () => {
    const subscriptionId = new UniqueEntityId();
    const invoice = Invoice.create(buildCreateInput({ subscriptionId })).getValue()!;
    assert.equal(invoice.subscriptionId?.equals(subscriptionId), true);
  });

  it("rejeita amount zero ou negativo", () => {
    assert.equal(Invoice.create(buildCreateInput({ amount: 0 })).isFailure, true);
    assert.equal(Invoice.create(buildCreateInput({ amount: -10 })).isFailure, true);
  });

  it("rejeita currency vazio", () => {
    const result = Invoice.create(buildCreateInput({ currency: "" }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("não dispara nenhum Domain Event na criação", () => {
    const invoice = Invoice.create(buildCreateInput()).getValue()!;
    assert.equal(invoice.domainEvents.length, 0);
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => Invoice.create(buildCreateInput({ amount: -1 })));
  });
});

describe("Invoice.markPaid", () => {
  it("transiciona \"pending\" → \"paid\" e dispara InvoicePaid", () => {
    const invoice = Invoice.create(buildCreateInput()).getValue()!;
    const result = invoice.markPaid();
    assert.equal(result.isSuccess, true);
    assert.equal(invoice.status, "paid");

    assert.equal(invoice.domainEvents.length, 1);
    const event = invoice.domainEvents[0]!;
    assert.equal(event instanceof InvoicePaid, true);
    assert.equal(event.aggregateId.equals(invoice.id), true);
    assert.equal(event.eventName, "InvoicePaid");
  });

  it("rejeita marcar uma Invoice já paga como paga de novo", () => {
    const invoice = Invoice.create(buildCreateInput()).getValue()!;
    invoice.markPaid();
    const result = invoice.markPaid();
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });
});

describe("Invoice.reconstitute", () => {
  it("restaura uma Invoice sem validar e sem disparar eventos", () => {
    const id = new UniqueEntityId();
    const now = new Date();
    const invoice = Invoice.reconstitute(
      { organizationId: new UniqueEntityId(), amount: 50, currency: "USD", status: "paid", createdAt: now, updatedAt: now },
      id,
    );
    assert.equal(invoice.id.equals(id), true);
    assert.equal(invoice.status, "paid");
    assert.equal(invoice.domainEvents.length, 0);
  });
});
