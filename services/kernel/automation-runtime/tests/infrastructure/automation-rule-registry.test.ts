import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, type DomainEvent } from "@novaris/shared-kernel";
import { InProcessEventBus } from "@novaris/event-bus";
import type { Logger, LogContext } from "@novaris/logging";
import type { Notifier, NotifierContext } from "@novaris/notifications";
import { AutomationRule } from "../../src/domain/aggregates/automation-rule/automation-rule.js";
import { InProcessAutomationRuntime } from "../../src/infrastructure/in-process-automation-runtime.js";
import { AutomationRuleRegistry } from "../../src/infrastructure/automation-rule-registry.js";

class FakeLogger implements Logger {
  readonly infos: Array<{ message: string; context?: LogContext }> = [];
  debug(): void {}
  info(message: string, context?: LogContext): void {
    this.infos.push({ message, context });
  }
  warn(): void {}
  error(): void {}
}

class FakeNotifier implements Notifier {
  notify(_recipientUserId: string, _message: string, _context?: NotifierContext): void {}
}

function fakeEvent(eventName: string): DomainEvent {
  return { eventId: "evt-1", aggregateId: new UniqueEntityId(), occurredAt: new Date(), eventName };
}

describe("AutomationRuleRegistry — activate", () => {
  it("ativa uma regra enabled: true — passa a reagir a eventos reais", () => {
    const eventBus = new InProcessEventBus();
    const logger = new FakeLogger();
    const registry = new AutomationRuleRegistry(new InProcessAutomationRuntime(eventBus, logger, new FakeNotifier()));
    const rule = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "Regra",
      triggerEventName: "TestEvent",
      actions: [{ type: "log", message: "x" }],
    }).getValue()!;

    registry.activate(rule);
    eventBus.publish(fakeEvent("TestEvent"));

    assert.equal(logger.infos.length, 1);
  });

  it("não ativa uma regra enabled: false", () => {
    const eventBus = new InProcessEventBus();
    const logger = new FakeLogger();
    const registry = new AutomationRuleRegistry(new InProcessAutomationRuntime(eventBus, logger, new FakeNotifier()));
    const rule = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "Regra",
      triggerEventName: "TestEvent",
      actions: [{ type: "log", message: "x" }],
      enabled: false,
    }).getValue()!;

    registry.activate(rule);
    eventBus.publish(fakeEvent("TestEvent"));

    assert.equal(logger.infos.length, 0);
  });

  it("desativar (enabled: false) uma regra já ativa interrompe a entrega", () => {
    const eventBus = new InProcessEventBus();
    const logger = new FakeLogger();
    const registry = new AutomationRuleRegistry(new InProcessAutomationRuntime(eventBus, logger, new FakeNotifier()));
    const rule = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "Regra",
      triggerEventName: "TestEvent",
      actions: [{ type: "log", message: "x" }],
    }).getValue()!;

    registry.activate(rule);
    rule.setEnabled(false);
    registry.activate(rule);
    eventBus.publish(fakeEvent("TestEvent"));

    assert.equal(logger.infos.length, 0);
  });

  it("reativar (enabled: true de novo) não duplica a entrega", () => {
    const eventBus = new InProcessEventBus();
    const logger = new FakeLogger();
    const registry = new AutomationRuleRegistry(new InProcessAutomationRuntime(eventBus, logger, new FakeNotifier()));
    const rule = AutomationRule.create({
      organizationId: new UniqueEntityId(),
      name: "Regra",
      triggerEventName: "TestEvent",
      actions: [{ type: "log", message: "x" }],
    }).getValue()!;

    registry.activate(rule);
    registry.activate(rule);
    registry.activate(rule);
    eventBus.publish(fakeEvent("TestEvent"));

    assert.equal(logger.infos.length, 1, "reativar a mesma regra não deveria duplicar a assinatura");
  });
});

describe("AutomationRuleRegistry — deactivate", () => {
  it("deactivate() de uma regra desconhecida não lança", () => {
    const eventBus = new InProcessEventBus();
    const registry = new AutomationRuleRegistry(new InProcessAutomationRuntime(eventBus, new FakeLogger(), new FakeNotifier()));
    assert.doesNotThrow(() => registry.deactivate("não-existe"));
  });
});
