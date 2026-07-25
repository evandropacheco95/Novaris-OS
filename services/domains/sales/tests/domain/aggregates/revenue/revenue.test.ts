import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Revenue } from "../../../../domain/aggregates/revenue/revenue.js";

describe("Revenue.create", () => {
  it("cria um Revenue válido", () => {
    const result = Revenue.create({
      organizationId: new UniqueEntityId(),
      contractId: new UniqueEntityId(),
      amount: 500,
      currency: "BRL",
    });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.amount, 500);
    assert.equal(result.getValue()!.currency, "BRL");
  });

  it("usa recognizedAt explícito quando fornecido", () => {
    const recognizedAt = new Date("2026-01-01T00:00:00.000Z");
    const revenue = Revenue.create({
      organizationId: new UniqueEntityId(),
      contractId: new UniqueEntityId(),
      amount: 500,
      currency: "BRL",
      recognizedAt,
    }).getValue()!;
    assert.equal(revenue.recognizedAt.getTime(), recognizedAt.getTime());
  });

  it("usa 'now' como recognizedAt quando omitido", () => {
    const before = Date.now();
    const revenue = Revenue.create({
      organizationId: new UniqueEntityId(),
      contractId: new UniqueEntityId(),
      amount: 500,
      currency: "BRL",
    }).getValue()!;
    assert.equal(revenue.recognizedAt.getTime() >= before, true);
  });

  it("rejeita amount <= 0", () => {
    const result = Revenue.create({ organizationId: new UniqueEntityId(), contractId: new UniqueEntityId(), amount: 0, currency: "BRL" });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita currency vazio", () => {
    const result = Revenue.create({ organizationId: new UniqueEntityId(), contractId: new UniqueEntityId(), amount: 500, currency: "  " });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("não dispara nenhum Domain Event (sem confirmação de fonte, `ADR-0047`)", () => {
    const revenue = Revenue.create({ organizationId: new UniqueEntityId(), contractId: new UniqueEntityId(), amount: 500, currency: "BRL" }).getValue()!;
    assert.equal(revenue.domainEvents.length, 0);
  });
});
