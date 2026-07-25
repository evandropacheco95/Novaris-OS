import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Dashboard } from "../../../../domain/aggregates/dashboard/dashboard.js";

function buildCreateInput(overrides: Partial<Parameters<typeof Dashboard.create>[0]> = {}) {
  return {
    organizationId: new UniqueEntityId(),
    name: "Painel de Vendas",
    ...overrides,
  };
}

describe("Dashboard.create", () => {
  it("cria um Dashboard válido apenas com name", () => {
    const input = buildCreateInput();
    const result = Dashboard.create(input);
    assert.equal(result.isSuccess, true);

    const dashboard = result.getValue()!;
    assert.equal(dashboard.organizationId.equals(input.organizationId), true);
    assert.equal(dashboard.name, "Painel de Vendas");
  });

  it("rejeita name vazio", () => {
    const result = Dashboard.create(buildCreateInput({ name: "" }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("não dispara nenhum Domain Event na criação", () => {
    const dashboard = Dashboard.create(buildCreateInput()).getValue()!;
    assert.equal(dashboard.domainEvents.length, 0);
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => Dashboard.create(buildCreateInput({ name: "" })));
  });
});

describe("Dashboard.reconstitute", () => {
  it("restaura um Dashboard sem validar e sem disparar eventos", () => {
    const id = new UniqueEntityId();
    const now = new Date();
    const dashboard = Dashboard.reconstitute(
      { organizationId: new UniqueEntityId(), name: "Restaurado", createdAt: now, updatedAt: now },
      id,
    );
    assert.equal(dashboard.id.equals(id), true);
    assert.equal(dashboard.name, "Restaurado");
    assert.equal(dashboard.domainEvents.length, 0);
  });
});
