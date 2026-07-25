import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { AutomationRule } from "../aggregates/automation-rule/automation-rule.js";

export interface AutomationRuleRepository extends ReadRepository<AutomationRule>, WriteRepository<AutomationRule> {}
