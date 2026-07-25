export interface ToggleAutomationRuleCommandInput {
  readonly ruleId: string;
  readonly enabled: boolean;
}

export class ToggleAutomationRuleCommand {
  readonly ruleId: string;
  readonly enabled: boolean;

  constructor(input: ToggleAutomationRuleCommandInput) {
    this.ruleId = input.ruleId;
    this.enabled = input.enabled;
    Object.freeze(this);
  }
}
