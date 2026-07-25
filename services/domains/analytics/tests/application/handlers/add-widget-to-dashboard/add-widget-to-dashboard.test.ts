import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Option, Result, type InfrastructureError } from "@novaris/shared-kernel";
import { Dashboard } from "../../../../domain/aggregates/dashboard/dashboard.js";
import type { DashboardRepository } from "../../../../domain/repositories/dashboard-repository.js";
import { AddWidgetToDashboardHandler } from "../../../../application/handlers/add-widget-to-dashboard/add-widget-to-dashboard.handler.js";
import { AddWidgetToDashboardCommand } from "../../../../application/commands/add-widget-to-dashboard/add-widget-to-dashboard.command.js";

class FakeDashboardRepository implements DashboardRepository {
  constructor(private readonly dashboards: Map<string, Dashboard> = new Map()) {}
  add(dashboard: Dashboard): void {
    this.dashboards.set(dashboard.id.toString(), dashboard);
  }
  async findById(id: UniqueEntityId): Promise<Result<Option<Dashboard>, InfrastructureError>> {
    const found = this.dashboards.get(id.toString());
    return Result.ok(found ? Option.some(found) : Option.none<Dashboard>());
  }
  async findAll(): Promise<Result<Dashboard[], InfrastructureError>> {
    return Result.ok([...this.dashboards.values()]);
  }
  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.dashboards.has(id.toString()));
  }
  async save(entity: Dashboard): Promise<Result<void, InfrastructureError>> {
    this.dashboards.set(entity.id.toString(), entity);
    return Result.ok(undefined);
  }
  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.dashboards.delete(id.toString());
    return Result.ok(undefined);
  }
}

describe("AddWidgetToDashboardHandler", () => {
  it("adiciona um Widget real a um Dashboard real", async () => {
    const repository = new FakeDashboardRepository();
    const handler = new AddWidgetToDashboardHandler(repository);

    const dashboard = Dashboard.create({ organizationId: new UniqueEntityId(), name: "Painel" }).getValue()!;
    repository.add(dashboard);

    const result = await handler.execute(
      new AddWidgetToDashboardCommand({ dashboardId: dashboard.id.toString(), type: "donut", title: "Pipeline", metricKey: "opportunities.byStatus" }),
    );
    assert.equal(result.isSuccess, true);
    const updated = result.getValue()!;
    assert.equal(updated.getWidgets().length, 1);
    assert.equal(updated.getWidgets()[0]!.type, "donut");
  });

  it("devolve NotFoundError para dashboardId inexistente", async () => {
    const repository = new FakeDashboardRepository();
    const handler = new AddWidgetToDashboardHandler(repository);

    const result = await handler.execute(
      new AddWidgetToDashboardCommand({ dashboardId: new UniqueEntityId().toString(), type: "kpi", title: "Widget", metricKey: "leads.new" }),
    );
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "NOT_FOUND_ERROR");
  });

  it("devolve ValidationError para title vazio", async () => {
    const repository = new FakeDashboardRepository();
    const handler = new AddWidgetToDashboardHandler(repository);

    const dashboard = Dashboard.create({ organizationId: new UniqueEntityId(), name: "Painel" }).getValue()!;
    repository.add(dashboard);

    const result = await handler.execute(new AddWidgetToDashboardCommand({ dashboardId: dashboard.id.toString(), type: "kpi", title: "", metricKey: "leads.new" }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });
});
