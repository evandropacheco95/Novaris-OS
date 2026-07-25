import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, type DomainEvent } from "@novaris/shared-kernel";
import { InProcessEventBus } from "@novaris/event-bus";
import type { Logger, LogContext } from "@novaris/logging";
import type { Notifier, NotifierContext } from "@novaris/notifications";
import { AutomationRule } from "../../src/domain/aggregates/automation-rule/automation-rule.js";
import { InProcessAutomationRuntime } from "../../src/infrastructure/in-process-automation-runtime.js";

class FakeLogger implements Logger {
  readonly infos: Array<{ message: string; context?: LogContext }> = [];
  readonly errors: Array<{ message: string; context?: LogContext }> = [];
  debug(): void {}
  info(message: string, context?: LogContext): void {
    this.infos.push({ message, context });
  }
  warn(): void {}
  error(message: string, context?: LogContext): void {
    this.errors.push({ message, context });
  }
}

class FakeNotifier implements Notifier {
  readonly notified: Array<{ recipientUserId: string; message: string; context?: NotifierContext }> = [];
  notify(recipientUserId: string, message: string, context?: NotifierContext): void {
    this.notified.push({ recipientUserId, message, context });
  }
}

function fakeEvent(eventName: string): DomainEvent {
  return { eventId: "evt-1", aggregateId: new UniqueEntityId(), occurredAt: new Date(), eventName };
}

function buildRule(actions: AutomationRule["actions"]) {
  return AutomationRule.create({
    organizationId: new UniqueEntityId(),
    name: "Regra de teste",
    triggerEventName: "TestEvent",
    actions: [...actions],
  }).getValue()!;
}

describe("InProcessAutomationRuntime — action log", () => {
  it("executa a action log quando o evento gatilho é publicado", () => {
    const eventBus = new InProcessEventBus();
    const logger = new FakeLogger();
    const runtime = new InProcessAutomationRuntime(eventBus, logger, new FakeNotifier());
    const rule = buildRule([{ type: "log", message: "Disparou!" }]);

    runtime.register(rule);
    eventBus.publish(fakeEvent("TestEvent"));

    assert.equal(logger.infos.length, 1);
    assert.match(logger.infos[0]!.message, /Regra de teste/);
    assert.match(logger.infos[0]!.message, /Disparou!/);
  });

  it("não executa quando o evento publicado tem outro nome", () => {
    const eventBus = new InProcessEventBus();
    const logger = new FakeLogger();
    const runtime = new InProcessAutomationRuntime(eventBus, logger, new FakeNotifier());
    const rule = buildRule([{ type: "log", message: "x" }]);

    runtime.register(rule);
    eventBus.publish(fakeEvent("OutroEvento"));

    assert.equal(logger.infos.length, 0);
  });
});

describe("InProcessAutomationRuntime — action notify", () => {
  it("chama o Notifier com recipientUserId/message da action", () => {
    const eventBus = new InProcessEventBus();
    const notifier = new FakeNotifier();
    const runtime = new InProcessAutomationRuntime(eventBus, new FakeLogger(), notifier);
    const rule = buildRule([{ type: "notify", recipientUserId: "user-42", message: "Olá!" }]);

    runtime.register(rule);
    eventBus.publish(fakeEvent("TestEvent"));

    assert.equal(notifier.notified.length, 1);
    assert.equal(notifier.notified[0]!.recipientUserId, "user-42");
    assert.equal(notifier.notified[0]!.message, "Olá!");
  });
});

describe("InProcessAutomationRuntime — action webhook", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("chama fetch com POST e o payload do evento", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    globalThis.fetch = ((url: string, init: RequestInit) => {
      calls.push({ url, init });
      return Promise.resolve(new Response(null, { status: 200 }));
    }) as typeof fetch;

    const eventBus = new InProcessEventBus();
    const runtime = new InProcessAutomationRuntime(eventBus, new FakeLogger(), new FakeNotifier());
    const rule = buildRule([{ type: "webhook", url: "https://exemplo.com/hook" }]);

    runtime.register(rule);
    eventBus.publish(fakeEvent("TestEvent"));
    await new Promise((resolve) => setTimeout(resolve, 10));

    assert.equal(calls.length, 1);
    assert.equal(calls[0]!.url, "https://exemplo.com/hook");
    assert.equal(calls[0]!.init.method, "POST");
    const body = JSON.parse(calls[0]!.init.body as string);
    assert.equal(body.rule, "Regra de teste");
    assert.equal(body.event.eventName, "TestEvent");
  });

  it("falha de fetch é isolada e logada, não lança", async () => {
    globalThis.fetch = (() => Promise.reject(new Error("network down"))) as typeof fetch;

    const eventBus = new InProcessEventBus();
    const logger = new FakeLogger();
    const runtime = new InProcessAutomationRuntime(eventBus, logger, new FakeNotifier());
    const rule = buildRule([{ type: "webhook", url: "https://exemplo.com/hook" }]);

    runtime.register(rule);
    assert.doesNotThrow(() => eventBus.publish(fakeEvent("TestEvent")));
    await new Promise((resolve) => setTimeout(resolve, 10));

    assert.equal(logger.errors.length, 1);
    assert.match(logger.errors[0]!.message, /Webhook/);
  });
});

describe("InProcessAutomationRuntime — unregister", () => {
  it("interrompe a entrega depois de unregister()", () => {
    const eventBus = new InProcessEventBus();
    const logger = new FakeLogger();
    const runtime = new InProcessAutomationRuntime(eventBus, logger, new FakeNotifier());
    const rule = buildRule([{ type: "log", message: "x" }]);

    const subscription = runtime.register(rule);
    runtime.unregister(subscription);
    eventBus.publish(fakeEvent("TestEvent"));

    assert.equal(logger.infos.length, 0);
  });
});

describe("InProcessAutomationRuntime — múltiplas actions", () => {
  it("executa todas as actions da regra, na ordem", () => {
    const eventBus = new InProcessEventBus();
    const logger = new FakeLogger();
    const notifier = new FakeNotifier();
    const runtime = new InProcessAutomationRuntime(eventBus, logger, notifier);
    const rule = buildRule([
      { type: "log", message: "primeira" },
      { type: "notify", recipientUserId: "user-1", message: "segunda" },
    ]);

    runtime.register(rule);
    eventBus.publish(fakeEvent("TestEvent"));

    assert.equal(logger.infos.length, 1);
    assert.equal(notifier.notified.length, 1);
  });
});
