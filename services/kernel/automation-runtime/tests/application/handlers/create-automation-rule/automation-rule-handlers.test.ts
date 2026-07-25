import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option, type DomainEvent, type InfrastructureError } from "@novaris/shared-kernel";
import { InProcessEventBus } from "@novaris/event-bus";
import type { Logger, LogContext } from "@novaris/logging";
import type { Notifier, NotifierContext } from "@novaris/notifications";
import { AutomationRule } from "../../../../src/domain/aggregates/automation-rule/automation-rule.js";
import type { AutomationRuleRepository } from "../../../../src/domain/repositories/automation-rule-repository.js";
import { InProcessAutomationRuntime } from "../../../../src/infrastructure/in-process-automation-runtime.js";
import { AutomationRuleRegistry } from "../../../../src/infrastructure/automation-rule-registry.js";
import { CreateAutomationRuleHandler } from "../../../../src/application/handlers/create-automation-rule/create-automation-rule.handler.js";
import { CreateAutomationRuleCommand } from "../../../../src/application/commands/create-automation-rule/create-automation-rule.command.js";
import { ToggleAutomationRuleHandler } from "../../../../src/application/handlers/toggle-automation-rule/toggle-automation-rule.handler.js";
import { ToggleAutomationRuleCommand } from "../../../../src/application/commands/toggle-automation-rule/toggle-automation-rule.command.js";

class FakeAutomationRuleRepository implements AutomationRuleRepository {
  private readonly records = new Map<string, AutomationRule>();

  async findById(id: UniqueEntityId): Promise<Result<Option<AutomationRule>, InfrastructureError>> {
    const found = this.records.get(id.toString());
    return Result.ok(found ? Option.some(found) : Option.none<AutomationRule>());
  }

  async findAll(): Promise<Result<AutomationRule[], InfrastructureError>> {
    return Result.ok(Array.from(this.records.values()));
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.records.has(id.toString()));
  }

  async save(entity: AutomationRule): Promise<Result<void, InfrastructureError>> {
    this.records.set(entity.id.toString(), entity);
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.records.delete(id.toString());
    return Result.ok(undefined);
  }
}

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

function buildHandlers() {
  const repository = new FakeAutomationRuleRepository();
  const eventBus = new InProcessEventBus();
  const logger = new FakeLogger();
  const registry = new AutomationRuleRegistry(new InProcessAutomationRuntime(eventBus, logger, new FakeNotifier()));
  const createHandler = new CreateAutomationRuleHandler(repository, registry);
  const toggleHandler = new ToggleAutomationRuleHandler(repository, registry);
  return { repository, eventBus, logger, createHandler, toggleHandler };
}

describe("CreateAutomationRuleHandler", () => {
  it("cria, persiste e já ativa a regra no Event Bus real", async () => {
    const { eventBus, logger, createHandler } = buildHandlers();

    const result = await createHandler.execute(
      new CreateAutomationRuleCommand({
        organizationId: new UniqueEntityId().toString(),
        name: "Regra ao vivo",
        triggerEventName: "TestEvent",
        actions: [{ type: "log", message: "disparou" }],
      }),
    );

    assert.equal(result.isSuccess, true);
    eventBus.publish(fakeEvent("TestEvent"));
    assert.equal(logger.infos.length, 1, "a regra criada deveria já estar reagindo a eventos reais, sem restart");
  });

  it("devolve ValidationError para actions vazio, sem persistir nem ativar", async () => {
    const { repository, createHandler } = buildHandlers();

    const result = await createHandler.execute(
      new CreateAutomationRuleCommand({ organizationId: new UniqueEntityId().toString(), name: "Regra", triggerEventName: "TestEvent", actions: [] }),
    );

    assert.equal(result.isFailure, true);
    assert.equal((await repository.findAll()).getValue()!.length, 0);
  });
});

describe("ToggleAutomationRuleHandler", () => {
  it("desativa uma regra ativa — evento deixa de disparar a action", async () => {
    const { eventBus, logger, createHandler, toggleHandler } = buildHandlers();

    const createResult = await createHandler.execute(
      new CreateAutomationRuleCommand({
        organizationId: new UniqueEntityId().toString(),
        name: "Regra",
        triggerEventName: "TestEvent",
        actions: [{ type: "log", message: "x" }],
      }),
    );
    const ruleId = createResult.getValue()!.id.toString();

    const toggleResult = await toggleHandler.execute(new ToggleAutomationRuleCommand({ ruleId, enabled: false }));
    assert.equal(toggleResult.isSuccess, true);
    assert.equal(toggleResult.getValue()!.enabled, false);

    eventBus.publish(fakeEvent("TestEvent"));
    assert.equal(logger.infos.length, 0);
  });

  it("devolve NotFoundError para ruleId inexistente", async () => {
    const { toggleHandler } = buildHandlers();

    const result = await toggleHandler.execute(new ToggleAutomationRuleCommand({ ruleId: new UniqueEntityId().toString(), enabled: false }));

    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "NOT_FOUND_ERROR");
  });
});
