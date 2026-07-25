import type { PrismaClient } from "@novaris/database";
import type { EventBus } from "@novaris/event-bus";
import type { Logger } from "@novaris/logging";
import type { Notifier } from "@novaris/notifications";
import { PrismaAutomationRuleRepository } from "./repositories/prisma-automation-rule-repository.js";
import { InProcessAutomationRuntime } from "./in-process-automation-runtime.js";
import { AutomationRuleRegistry } from "./automation-rule-registry.js";

export function createAutomationRuleRepository(prisma: PrismaClient): PrismaAutomationRuleRepository {
  return new PrismaAutomationRuleRepository(prisma);
}

export function createAutomationRuleRegistry(eventBus: EventBus, logger: Logger, notifier: Notifier): AutomationRuleRegistry {
  return new AutomationRuleRegistry(new InProcessAutomationRuntime(eventBus, logger, notifier));
}
