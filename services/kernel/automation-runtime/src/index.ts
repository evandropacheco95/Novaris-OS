// Automation Runtime Service — barrel de exportação pública (`ADR-0041`).

export {
  AutomationRule,
  type AutomationRuleProps,
  type CreateAutomationRuleInput,
  type AutomationAction,
} from "./domain/aggregates/automation-rule/automation-rule.js";
export type { AutomationRuleRepository } from "./domain/repositories/automation-rule-repository.js";
export type { AutomationRuntime } from "./domain/services/automation-runtime.js";

export { CreateAutomationRuleCommand } from "./application/commands/create-automation-rule/create-automation-rule.command.js";
export { CreateAutomationRuleHandler } from "./application/handlers/create-automation-rule/create-automation-rule.handler.js";
export { ToggleAutomationRuleCommand } from "./application/commands/toggle-automation-rule/toggle-automation-rule.command.js";
export { ToggleAutomationRuleHandler } from "./application/handlers/toggle-automation-rule/toggle-automation-rule.handler.js";

export { InProcessAutomationRuntime } from "./infrastructure/in-process-automation-runtime.js";
export { AutomationRuleRegistry } from "./infrastructure/automation-rule-registry.js";
export { createAutomationRuleRepository, createAutomationRuleRegistry } from "./infrastructure/factories.js";
