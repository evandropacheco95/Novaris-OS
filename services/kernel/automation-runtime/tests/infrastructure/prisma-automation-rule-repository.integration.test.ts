import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { AutomationRule } from "../../src/domain/aggregates/automation-rule/automation-rule.js";
import { PrismaAutomationRuleRepository } from "../../src/infrastructure/repositories/prisma-automation-rule-repository.js";

describe("PrismaAutomationRuleRepository — integração real (Supabase)", () => {
  const repository = new PrismaAutomationRuleRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.automationRule.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera uma AutomationRule real do Postgres, incluindo actions (Json)", async () => {
    const rule = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "Regra real",
      triggerEventName: "UserCreated",
      actions: [
        { type: "log", message: "Novo usuário" },
        { type: "webhook", url: "https://exemplo.com/hook" },
      ],
    }).getValue()!;
    createdIds.push(rule.id.toString());

    const saveResult = await repository.save(rule);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const found = (await repository.findById(rule.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.name, "Regra real");
    assert.equal(found.triggerEventName, "UserCreated");
    assert.equal(found.actions.length, 2);
    assert.deepEqual(found.actions[0], { type: "log", message: "Novo usuário" });
    assert.deepEqual(found.actions[1], { type: "webhook", url: "https://exemplo.com/hook" });
    assert.equal(found.enabled, true);
  });

  it("persiste setEnabled(false) e reflete no re-fetch", async () => {
    const rule = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "Regra a desativar",
      triggerEventName: "UserCreated",
      actions: [{ type: "log", message: "x" }],
    }).getValue()!;
    createdIds.push(rule.id.toString());
    await repository.save(rule);

    rule.setEnabled(false);
    await repository.save(rule);

    const found = (await repository.findById(rule.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.enabled, false);
  });

  it("exists()/delete() funcionam contra o banco real", async () => {
    const rule = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "Regra temporária",
      triggerEventName: "UserCreated",
      actions: [{ type: "log", message: "x" }],
    }).getValue()!;
    await repository.save(rule);

    assert.equal((await repository.exists(rule.id)).getValue(), true);
    await repository.delete(rule.id);
    assert.equal((await repository.exists(rule.id)).getValue(), false);
  });
});
