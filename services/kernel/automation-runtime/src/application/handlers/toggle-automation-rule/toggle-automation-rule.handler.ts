import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { AutomationRule } from "../../../domain/aggregates/automation-rule/automation-rule.js";
import type { AutomationRuleRepository } from "../../../domain/repositories/automation-rule-repository.js";
import type { AutomationRuleRegistry } from "../../../infrastructure/automation-rule-registry.js";
import type { ToggleAutomationRuleCommand } from "../../commands/toggle-automation-rule/toggle-automation-rule.command.js";

/**
 * ToggleAutomationRuleHandler — Application Layer, `automation-runtime`
 * (`ADR-0041`). `registry.activate(rule)` reavalia `rule.enabled` — desliga
 * a assinatura real do Event Bus se `enabled: false`, liga se `true`.
 */
export class ToggleAutomationRuleHandler {
  constructor(
    private readonly repository: AutomationRuleRepository,
    private readonly registry: AutomationRuleRegistry,
  ) {}

  async execute(command: ToggleAutomationRuleCommand): Promise<Result<AutomationRule, DomainError | InfrastructureError>> {
    const findResult = await this.repository.findById(new UniqueEntityId(command.ruleId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`AutomationRule "${command.ruleId}" não encontrada`));
    }
    const rule = option.getOrElse(null as never);
    rule.setEnabled(command.enabled);

    const saveResult = await this.repository.save(rule);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    this.registry.activate(rule);
    return Result.ok(rule);
  }
}
