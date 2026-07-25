import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Dashboard } from "../../../domain/aggregates/dashboard/dashboard.js";
import { PrismaDashboardRepository } from "../../../infrastructure/repositories/prisma-dashboard-repository.js";

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), via
 * `@novaris/database`. Prova que `PrismaDashboardRepository` funciona contra
 * um banco de dados real.
 */
describe("PrismaDashboardRepository — integração real (Supabase)", () => {
  const repository = new PrismaDashboardRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.dashboard.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera um Dashboard real do Postgres", async () => {
    const dashboard = Dashboard.create({ organizationId: new UniqueEntityId(), name: "Painel Integração" }).getValue()!;
    createdIds.push(dashboard.id.toString());

    const saveResult = await repository.save(dashboard);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const fetched = (await repository.findById(dashboard.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.name, "Painel Integração");
  });

  it("exists() e delete() funcionam contra o banco real", async () => {
    const dashboard = Dashboard.create({ organizationId: new UniqueEntityId(), name: "Temporário" }).getValue()!;
    await repository.save(dashboard);
    createdIds.push(dashboard.id.toString());

    assert.equal((await repository.exists(dashboard.id)).getValue(), true);
    await repository.delete(dashboard.id);
    assert.equal((await repository.exists(dashboard.id)).getValue(), false);
  });

  it("persiste widgets reais, via a coleção do Dashboard (`ADR-0049`)", async () => {
    const dashboard = Dashboard.create({ organizationId: new UniqueEntityId(), name: "Com Widgets" }).getValue()!;
    createdIds.push(dashboard.id.toString());
    dashboard.addWidget({ type: "kpi", title: "Oportunidades abertas", metricKey: "opportunities.open" });
    dashboard.addWidget({ type: "donut", title: "Pipeline", metricKey: "opportunities.byStatus" });

    const saveResult = await repository.save(dashboard);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const fetched = (await repository.findById(dashboard.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.getWidgets().length, 2);
    assert.equal(fetched.getWidgets().some((w) => w.type === "kpi"), true);
    assert.equal(fetched.getWidgets().some((w) => w.type === "donut"), true);
  });
});
