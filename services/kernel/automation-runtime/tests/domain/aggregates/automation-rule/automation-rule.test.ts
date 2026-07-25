import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { AutomationRule } from "../../../../src/domain/aggregates/automation-rule/automation-rule.js";

describe("AutomationRule.create", () => {
  it("cria uma regra válida com action log, habilitada por padrão", () => {
    const result = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "Loga toda criação de usuário",
      triggerEventName: "UserCreated",
      actions: [{ type: "log", message: "Novo usuário!" }],
    });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.enabled, true);
  });

  it("aceita enabled: false explícito", () => {
    const result = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "Regra em rascunho",
      triggerEventName: "UserCreated",
      actions: [{ type: "log", message: "x" }],
      enabled: false,
    });
    assert.equal(result.getValue()!.enabled, false);
  });

  it("rejeita name vazio", () => {
    const result = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "  ",
      triggerEventName: "UserCreated",
      actions: [{ type: "log", message: "x" }],
    });
    assert.equal(result.isFailure, true);
  });

  it("rejeita triggerEventName vazio", () => {
    const result = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "Regra",
      triggerEventName: "",
      actions: [{ type: "log", message: "x" }],
    });
    assert.equal(result.isFailure, true);
  });

  it("rejeita actions vazio", () => {
    const result = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "Regra",
      triggerEventName: "UserCreated",
      actions: [],
    });
    assert.equal(result.isFailure, true);
    assert.match(result.getError()!.message, /ao menos 1 ação/);
  });

  it("rejeita action notify sem recipientUserId", () => {
    const result = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "Regra",
      triggerEventName: "UserCreated",
      actions: [{ type: "notify", recipientUserId: "", message: "x" }],
    });
    assert.equal(result.isFailure, true);
  });

  it("rejeita action webhook com url inválida", () => {
    const result = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "Regra",
      triggerEventName: "UserCreated",
      actions: [{ type: "webhook", url: "não-é-uma-url" }],
    });
    assert.equal(result.isFailure, true);
  });

  it("aceita action webhook com url válida", () => {
    const result = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "Regra",
      triggerEventName: "UserCreated",
      actions: [{ type: "webhook", url: "https://exemplo.com/hook" }],
    });
    assert.equal(result.isSuccess, true);
  });

  it("aceita múltiplas actions na mesma regra", () => {
    const result = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "Regra combinada",
      triggerEventName: "UserCreated",
      actions: [
        { type: "log", message: "log" },
        { type: "notify", recipientUserId: "user-1", message: "notify" },
        { type: "webhook", url: "https://exemplo.com/hook" },
      ],
    });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.actions.length, 3);
  });
});

describe("AutomationRule.reconstitute", () => {
  it("recria sem validar", () => {
    const id = new UniqueEntityId();
    const now = new Date();
    const rule = AutomationRule.reconstitute(
      {
        organizationId: new UniqueEntityId(),
        name: "x",
        triggerEventName: "y",
        actions: [{ type: "log", message: "z" }],
        enabled: true,
        createdAt: now,
        updatedAt: now,
      },
      id,
    );
    assert.equal(rule.id.equals(id), true);
  });
});

describe("AutomationRule.setEnabled", () => {
  it("alterna enabled e atualiza updatedAt", async () => {
    const rule = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "Regra",
      triggerEventName: "UserCreated",
      actions: [{ type: "log", message: "x" }],
    }).getValue()!;
    const before = rule.updatedAt;
    await new Promise((resolve) => setTimeout(resolve, 5));

    rule.setEnabled(false);

    assert.equal(rule.enabled, false);
    assert.ok(rule.updatedAt.getTime() >= before.getTime());
  });
});
