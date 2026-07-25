import type { AutomationAction } from "../../../domain/aggregates/automation-rule/automation-rule.js";

export interface CreateAutomationRuleCommandInput {
  readonly organizationId: string;
  readonly name: string;
  readonly triggerEventName: string;
  readonly actions: AutomationAction[];
}

export class CreateAutomationRuleCommand {
  readonly organizationId: string;
  readonly name: string;
  readonly triggerEventName: string;
  readonly actions: AutomationAction[];

  constructor(input: CreateAutomationRuleCommandInput) {
    this.organizationId = input.organizationId;
    this.name = input.name;
    this.triggerEventName = input.triggerEventName;
    this.actions = input.actions;
    Object.freeze(this);
  }
}
