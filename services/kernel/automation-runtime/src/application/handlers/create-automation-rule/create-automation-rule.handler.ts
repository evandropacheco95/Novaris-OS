import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { AutomationRule } from "../../../domain/aggregates/automation-rule/automation-rule.js";
import type { AutomationRuleRepository } from "../../../domain/repositories/automation-rule-repository.js";
import type { AutomationRuleRegistry } from "../../../infrastructure/automation-rule-registry.js";
import type { CreateAutomationRuleCommand } from "../../commands/create-automation-rule/create-automation-rule.command.js";

/**
 * CreateAutomationRuleHandler — Application Layer, `automation-runtime`
 * (`ADR-0041`). Depois de `save()` ter sucesso, ativa a regra de verdade no
 * `AutomationRuleRegistry` — a regra já passa a reagir a eventos reais no
 * mesmo processo, sem esperar um restart.
 */
export class CreateAutomationRuleHandler {
  constructor(
    private readonly repository: AutomationRuleRepository,
    private readonly registry: AutomationRuleRegistry,
  ) {}

  async execute(command: CreateAutomationRuleCommand): Promise<Result<AutomationRule, DomainError | InfrastructureError>> {
    const createResult = AutomationRule.create({
      organizationId: new UniqueEntityId(command.organizationId),
      name: command.name,
      triggerEventName: command.triggerEventName,
      actions: command.actions,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const rule = createResult.getValue()!;

    const saveResult = await this.repository.save(rule);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    this.registry.activate(rule);
    return Result.ok(rule);
  }
}
