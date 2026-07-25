import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { FeatureFlag } from "../../../../src/domain/aggregates/feature-flag/feature-flag.js";

describe("FeatureFlag.create", () => {
  it("cria uma FeatureFlag válida, habilitada", () => {
    const result = FeatureFlag.create({ organizationId: new UniqueEntityId(), key: "novo-dashboard", enabled: true });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.enabled, true);
  });

  it("cria uma FeatureFlag válida, desabilitada", () => {
    const result = FeatureFlag.create({ organizationId: new UniqueEntityId(), key: "novo-dashboard", enabled: false });
    assert.equal(result.getValue()!.enabled, false);
  });

  it("rejeita key vazia", () => {
    const result = FeatureFlag.create({ organizationId: new UniqueEntityId(), key: "", enabled: true });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });
});

describe("FeatureFlag.reconstitute", () => {
  it("recria sem validar", () => {
    const id = new UniqueEntityId();
    const now = new Date();
    const flag = FeatureFlag.reconstitute({ organizationId: new UniqueEntityId(), key: "x", enabled: true, createdAt: now, updatedAt: now }, id);
    assert.equal(flag.id.equals(id), true);
  });
});

describe("FeatureFlag.setEnabled", () => {
  it("alterna enabled e atualiza updatedAt", async () => {
    const flag = FeatureFlag.create({ organizationId: new UniqueEntityId(), key: "x", enabled: false }).getValue()!;
    const before = flag.updatedAt;
    await new Promise((resolve) => setTimeout(resolve, 5));

    flag.setEnabled(true);

    assert.equal(flag.enabled, true);
    assert.ok(flag.updatedAt.getTime() >= before.getTime());
  });
});
