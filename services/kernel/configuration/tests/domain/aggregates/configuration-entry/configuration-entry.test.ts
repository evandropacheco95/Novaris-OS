import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { ConfigurationEntry } from "../../../../src/domain/aggregates/configuration-entry/configuration-entry.js";

describe("ConfigurationEntry.create", () => {
  it("cria uma ConfigurationEntry válida", () => {
    const result = ConfigurationEntry.create({ organizationId: new UniqueEntityId(), key: "tema", value: "escuro" });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.key, "tema");
    assert.equal(result.getValue()!.value, "escuro");
  });

  it("rejeita key vazia", () => {
    const result = ConfigurationEntry.create({ organizationId: new UniqueEntityId(), key: "   ", value: "x" });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("aceita value vazio — não há regra contra valor vazio, só contra key vazia", () => {
    const result = ConfigurationEntry.create({ organizationId: new UniqueEntityId(), key: "tema", value: "" });
    assert.equal(result.isSuccess, true);
  });
});

describe("ConfigurationEntry.reconstitute", () => {
  it("recria sem validar", () => {
    const id = new UniqueEntityId();
    const now = new Date();
    const entry = ConfigurationEntry.reconstitute(
      { organizationId: new UniqueEntityId(), key: "x", value: "y", createdAt: now, updatedAt: now },
      id,
    );
    assert.equal(entry.id.equals(id), true);
  });
});

describe("ConfigurationEntry.updateValue", () => {
  it("atualiza value e updatedAt", async () => {
    const entry = ConfigurationEntry.create({ organizationId: new UniqueEntityId(), key: "tema", value: "escuro" }).getValue()!;
    const before = entry.updatedAt;
    await new Promise((resolve) => setTimeout(resolve, 5));

    entry.updateValue("claro");

    assert.equal(entry.value, "claro");
    assert.ok(entry.updatedAt.getTime() >= before.getTime());
  });
});
