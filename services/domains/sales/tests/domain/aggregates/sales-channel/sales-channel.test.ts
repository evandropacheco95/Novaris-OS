import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { SalesChannel } from "../../../../domain/aggregates/sales-channel/sales-channel.js";

describe("SalesChannel.create", () => {
  it("cria um SalesChannel válido, ativo por padrão", () => {
    const result = SalesChannel.create({ organizationId: new UniqueEntityId(), name: "Direto", type: "direct" });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.active, true);
    assert.equal(result.getValue()!.type, "direct");
  });

  it("aceita os 4 tipos confirmados (direct/distributor/marketplace/online_store)", () => {
    for (const type of ["direct", "distributor", "marketplace", "online_store"] as const) {
      const result = SalesChannel.create({ organizationId: new UniqueEntityId(), name: `Canal ${type}`, type });
      assert.equal(result.isSuccess, true, `tipo "${type}" deveria ser aceito`);
    }
  });

  it("rejeita name vazio", () => {
    const result = SalesChannel.create({ organizationId: new UniqueEntityId(), name: "  ", type: "direct" });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita type fora da união conhecida", () => {
    const result = SalesChannel.create({ organizationId: new UniqueEntityId(), name: "X", type: "reseller" as never });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("sem Domain Events (mesmo critério de Pipeline/Product)", () => {
    const salesChannel = SalesChannel.create({ organizationId: new UniqueEntityId(), name: "X", type: "direct" }).getValue()!;
    assert.equal(salesChannel.domainEvents.length, 0);
  });
});

describe("SalesChannel.rename", () => {
  it("renomeia com sucesso", () => {
    const salesChannel = SalesChannel.create({ organizationId: new UniqueEntityId(), name: "X", type: "direct" }).getValue()!;
    const result = salesChannel.rename("Direto B2B");
    assert.equal(result.isSuccess, true);
    assert.equal(salesChannel.name, "Direto B2B");
  });

  it("rejeita rename com name vazio", () => {
    const salesChannel = SalesChannel.create({ organizationId: new UniqueEntityId(), name: "X", type: "direct" }).getValue()!;
    const result = salesChannel.rename("");
    assert.equal(result.isFailure, true);
    assert.equal(salesChannel.name, "X");
  });
});

describe("SalesChannel.deactivate/activate", () => {
  it("desativa e reativa", () => {
    const salesChannel = SalesChannel.create({ organizationId: new UniqueEntityId(), name: "X", type: "marketplace" }).getValue()!;
    assert.equal(salesChannel.deactivate().isSuccess, true);
    assert.equal(salesChannel.active, false);
    assert.equal(salesChannel.activate().isSuccess, true);
    assert.equal(salesChannel.active, true);
  });

  it("rejeita desativar duas vezes", () => {
    const salesChannel = SalesChannel.create({ organizationId: new UniqueEntityId(), name: "X", type: "marketplace" }).getValue()!;
    salesChannel.deactivate();
    const result = salesChannel.deactivate();
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });

  it("rejeita ativar um SalesChannel já ativo", () => {
    const salesChannel = SalesChannel.create({ organizationId: new UniqueEntityId(), name: "X", type: "marketplace" }).getValue()!;
    const result = salesChannel.activate();
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });
});
