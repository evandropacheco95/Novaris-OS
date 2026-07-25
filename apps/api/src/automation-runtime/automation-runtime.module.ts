import { Inject, Module, type OnModuleInit } from "@nestjs/common";
import { prisma } from "@novaris/database";
import { eventBus } from "@novaris/event-bus";
import { ConsoleLogger } from "@novaris/logging";
import { ConsoleNotifier } from "@novaris/notifications";
import {
  createAutomationRuleRepository,
  createAutomationRuleRegistry,
  CreateAutomationRuleHandler,
  ToggleAutomationRuleHandler,
  type AutomationRuleRepository,
  type AutomationRuleRegistry,
} from "@novaris/automation-runtime";
import { AuthModule } from "../auth/auth.module.js";
import { AutomationRuleController } from "./automation-rule.controller.js";

const AUTOMATION_RULE_REPOSITORY = "AutomationRuleRepository";
const AUTOMATION_RULE_REGISTRY = "AutomationRuleRegistry";

/**
 * AutomationRuntimeModule — Composition Root de `automation-runtime`
 * (`ADR-0041`, `ENG-0142`). `onModuleInit` recarrega e reativa toda regra
 * `enabled: true` já persistida — `InProcessEventBus`/`AutomationRuleRegistry`
 * não sobrevivem a um restart do processo (mesma limitação já aceita para o
 * Event Bus puro), então o processo precisa refazer isso a cada boot.
 */
@Module({
  imports: [AuthModule],
  controllers: [AutomationRuleController],
  providers: [
    { provide: AUTOMATION_RULE_REPOSITORY, useFactory: () => createAutomationRuleRepository(prisma) },
    {
      provide: AUTOMATION_RULE_REGISTRY,
      useFactory: () => createAutomationRuleRegistry(eventBus, new ConsoleLogger(), new ConsoleNotifier(new ConsoleLogger())),
    },
    {
      provide: CreateAutomationRuleHandler,
      useFactory: (repository: AutomationRuleRepository, registry: AutomationRuleRegistry) => new CreateAutomationRuleHandler(repository, registry),
      inject: [AUTOMATION_RULE_REPOSITORY, AUTOMATION_RULE_REGISTRY],
    },
    {
      provide: ToggleAutomationRuleHandler,
      useFactory: (repository: AutomationRuleRepository, registry: AutomationRuleRegistry) => new ToggleAutomationRuleHandler(repository, registry),
      inject: [AUTOMATION_RULE_REPOSITORY, AUTOMATION_RULE_REGISTRY],
    },
  ],
})
export class AutomationRuntimeModule implements OnModuleInit {
  constructor(
    @Inject(AUTOMATION_RULE_REPOSITORY) private readonly repository: AutomationRuleRepository,
    @Inject(AUTOMATION_RULE_REGISTRY) private readonly registry: AutomationRuleRegistry,
  ) {}

  async onModuleInit(): Promise<void> {
    const result = await this.repository.findAll();
    if (result.isFailure) {
      return;
    }
    for (const rule of result.getValue()!) {
      this.registry.activate(rule);
    }
  }
}
