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
    assert.equal(dashboard.getWidgets().length, 0);
  });
});

describe("Dashboard.addWidget", () => {
  it("adiciona um Widget válido (`ADR-0049`)", () => {
    const dashboard = Dashboard.create(buildCreateInput()).getValue()!;
    const result = dashboard.addWidget({ type: "kpi", title: "Oportunidades abertas", metricKey: "opportunities.open" });
    assert.equal(result.isSuccess, true);
    assert.equal(dashboard.getWidgets().length, 1);
    assert.equal(dashboard.getWidgets()[0]!.type, "kpi");
    assert.equal(dashboard.getWidgets()[0]!.title, "Oportunidades abertas");
    assert.equal(dashboard.getWidgets()[0]!.metricKey, "opportunities.open");
  });

  it("aceita os 4 tipos de visualização", () => {
    const dashboard = Dashboard.create(buildCreateInput()).getValue()!;
    for (const type of ["kpi", "list", "donut", "bar"] as const) {
      const result = dashboard.addWidget({ type, title: `Widget ${type}`, metricKey: "leads.new" });
      assert.equal(result.isSuccess, true);
    }
    assert.equal(dashboard.getWidgets().length, 4);
  });

  it("rejeita title vazio", () => {
    const dashboard = Dashboard.create(buildCreateInput()).getValue()!;
    const result = dashboard.addWidget({ type: "kpi", title: "", metricKey: "leads.new" });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
    assert.equal(dashboard.getWidgets().length, 0);
  });

  it("getWidgets() devolve uma cópia defensiva", () => {
    const dashboard = Dashboard.create(buildCreateInput()).getValue()!;
    dashboard.addWidget({ type: "kpi", title: "Widget", metricKey: "leads.new" });
    const widgets = dashboard.getWidgets() as unknown as Array<unknown>;
    widgets.push({});
    assert.equal(dashboard.getWidgets().length, 1);
  });
});
