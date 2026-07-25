import { UniqueEntityId } from "@novaris/shared-kernel";
import type { AutomationRule as PrismaAutomationRule, Prisma } from "@novaris/database";
import { AutomationRule, type AutomationAction } from "../../domain/aggregates/automation-rule/automation-rule.js";

export class PrismaAutomationRuleMapper {
  static toDomain(record: PrismaAutomationRule): AutomationRule {
    return AutomationRule.reconstitute(
      {
        organizationId: new UniqueEntityId(record.organizationId),
        name: record.name,
        triggerEventName: record.triggerEventName,
        actions: record.actions as unknown as AutomationAction[],
        enabled: record.enabled,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
      new UniqueEntityId(record.id),
    );
  }

  static toPersistence(rule: AutomationRule): {
    id: string;
    organizationId: string;
    name: string;
    triggerEventName: string;
    actions: Prisma.InputJsonValue;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: rule.id.toString(),
      organizationId: rule.organizationId.toString(),
      name: rule.name,
      triggerEventName: rule.triggerEventName,
      actions: rule.actions as unknown as Prisma.InputJsonValue,
      enabled: rule.enabled,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }
}
