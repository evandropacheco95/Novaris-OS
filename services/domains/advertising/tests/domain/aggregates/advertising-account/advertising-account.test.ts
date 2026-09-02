import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { AdvertisingAccount } from "../../../../domain/aggregates/advertising-account/advertising-account.js";

function buildCreateInput(overrides: Partial<Parameters<typeof AdvertisingAccount.create>[0]> = {}) {
  return {
    organizationId: new UniqueEntityId(),
    provider: "google_ads" as const,
    name: "Winnet Metais — Google Ads",
    ...overrides,
  };
}

describe("AdvertisingAccount.create", () => {
  it("cria uma AdvertisingAccount válida sempre em NOT_CONNECTED", () => {
    const input = buildCreateInput();
    const result = AdvertisingAccount.create(input);
    assert.equal(result.isSuccess, true);

    const account = result.getValue()!;
    assert.equal(account.organizationId.equals(input.organizationId), true);
    assert.equal(account.provider, "google_ads");
    assert.equal(account.name, "Winnet Metais — Google Ads");
    assert.equal(account.connectionStatus, "NOT_CONNECTED");
    assert.equal(account.externalAccountId, undefined);
    assert.equal(account.connectedAt, undefined);
    assert.equal(account.lastSyncAt, undefined);
  });

  it("rejeita provider inválido", () => {
    const result = AdvertisingAccount.create(buildCreateInput({ provider: "meta_ads" as never }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita name vazio", () => {
    const result = AdvertisingAccount.create(buildCreateInput({ name: "" }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita name apenas com espaços", () => {
    const result = AdvertisingAccount.create(buildCreateInput({ name: "   " }));
    assert.equal(result.isFailure, true);
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => AdvertisingAccount.create(buildCreateInput({ name: "" })));
  });
});

describe("AdvertisingAccount.reconstitute", () => {
  it("restaura uma AdvertisingAccount sem validar", () => {
    const id = new UniqueEntityId();
    const now = new Date();
    const account = AdvertisingAccount.reconstitute(
      {
        organizationId: new UniqueEntityId(),
        provider: "google_ads",
        name: "Restaurada",
        connectionStatus: "CONNECTED",
        externalAccountId: "123-456-7890",
        connectedAt: now,
        lastSyncAt: now,
        createdAt: now,
        updatedAt: now,
      },
      id,
    );
    assert.equal(account.id.equals(id), true);
    assert.equal(account.connectionStatus, "CONNECTED");
    assert.equal(account.externalAccountId, "123-456-7890");
  });
});
