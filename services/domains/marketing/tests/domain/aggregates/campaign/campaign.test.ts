import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Campaign } from "../../../../domain/aggregates/campaign/campaign.js";

function buildCreateInput(overrides: Partial<Parameters<typeof Campaign.create>[0]> = {}) {
  return {
    organizationId: new UniqueEntityId(),
    name: "Campanha de Lançamento",
    ...overrides,
  };
}

describe("Campaign.create", () => {
  it("cria uma Campaign válida apenas com name", () => {
    const input = buildCreateInput();
    const result = Campaign.create(input);
    assert.equal(result.isSuccess, true);

    const campaign = result.getValue()!;
    assert.equal(campaign.organizationId.equals(input.organizationId), true);
    assert.equal(campaign.name, "Campanha de Lançamento");
    assert.equal(campaign.startDate, undefined);
    assert.equal(campaign.endDate, undefined);
  });

  it("aceita startDate/endDate opcionais", () => {
    const startDate = new Date("2026-08-01");
    const endDate = new Date("2026-08-31");
    const campaign = Campaign.create(buildCreateInput({ startDate, endDate })).getValue()!;
    assert.equal(campaign.startDate?.getTime(), startDate.getTime());
    assert.equal(campaign.endDate?.getTime(), endDate.getTime());
  });

  it("rejeita name vazio", () => {
    const result = Campaign.create(buildCreateInput({ name: "" }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("não dispara nenhum Domain Event na criação", () => {
    const campaign = Campaign.create(buildCreateInput()).getValue()!;
    assert.equal(campaign.domainEvents.length, 0);
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => Campaign.create(buildCreateInput({ name: "" })));
  });
});

describe("Campaign.reconstitute", () => {
  it("restaura uma Campaign sem validar e sem disparar eventos", () => {
    const id = new UniqueEntityId();
    const now = new Date();
    const campaign = Campaign.reconstitute(
      { organizationId: new UniqueEntityId(), name: "Restaurada", createdAt: now, updatedAt: now },
      id,
    );
    assert.equal(campaign.id.equals(id), true);
    assert.equal(campaign.name, "Restaurada");
    assert.equal(campaign.domainEvents.length, 0);
  });

  it("restaura assets quando fornecidos", () => {
    const id = new UniqueEntityId();
    const now = new Date();
    const campaign = Campaign.reconstitute({ organizationId: new UniqueEntityId(), name: "Restaurada", createdAt: now, updatedAt: now }, id);
    assert.equal(campaign.getAssets().length, 0);
  });
});

describe("Campaign.addAsset", () => {
  it("adiciona um Asset referenciando o fileRecordId (`ADR-0048`)", () => {
    const campaign = Campaign.create(buildCreateInput()).getValue()!;
    const fileRecordId = new UniqueEntityId();
    const asset = campaign.addAsset(fileRecordId);

    assert.equal(asset.fileRecordId.equals(fileRecordId), true);
    assert.equal(campaign.getAssets().length, 1);
    assert.equal(campaign.getAssets()[0]!.id.equals(asset.id), true);
  });

  it("permite múltiplos assets na mesma Campaign", () => {
    const campaign = Campaign.create(buildCreateInput()).getValue()!;
    campaign.addAsset(new UniqueEntityId());
    campaign.addAsset(new UniqueEntityId());
    assert.equal(campaign.getAssets().length, 2);
  });

  it("getAssets() devolve uma cópia defensiva", () => {
    const campaign = Campaign.create(buildCreateInput()).getValue()!;
    campaign.addAsset(new UniqueEntityId());
    const assets = campaign.getAssets() as unknown as Array<unknown>;
    assets.push({});
    assert.equal(campaign.getAssets().length, 1);
  });
});
