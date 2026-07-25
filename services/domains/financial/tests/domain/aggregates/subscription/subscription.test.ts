import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Subscription } from "../../../../domain/aggregates/subscription/subscription.js";

function buildCreateInput(overrides: Partial<Parameters<typeof Subscription.create>[0]> = {}) {
  return {
    organizationId: new UniqueEntityId(),
    name: "Plano Mensal",
    ...overrides,
  };
}

describe("Subscription.create", () => {
  it("cria uma Subscription válida", () => {
    const input = buildCreateInput();
    const result = Subscription.create(input);
    assert.equal(result.isSuccess, true);

    const subscription = result.getValue()!;
    assert.equal(subscription.organizationId.equals(input.organizationId), true);
    assert.equal(subscription.name, "Plano Mensal");
  });

  it("rejeita name vazio", () => {
    const result = Subscription.create(buildCreateInput({ name: "" }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("não dispara nenhum Domain Event (nenhum confirmado em DOMAIN_MODEL.md)", () => {
    const subscription = Subscription.create(buildCreateInput()).getValue()!;
    assert.equal(subscription.domainEvents.length, 0);
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => Subscription.create(buildCreateInput({ name: "" })));
  });
});

describe("Subscription.reconstitute", () => {
  it("restaura uma Subscription sem validar e sem disparar eventos", () => {
    const id = new UniqueEntityId();
    const now = new Date();
    const subscription = Subscription.reconstitute(
      { organizationId: new UniqueEntityId(), name: "Restaurado", createdAt: now, updatedAt: now },
      id,
    );
    assert.equal(subscription.id.equals(id), true);
    assert.equal(subscription.domainEvents.length, 0);
  });
});
