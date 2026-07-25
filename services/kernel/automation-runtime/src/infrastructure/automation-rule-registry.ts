import type { Subscription } from "@novaris/event-bus";
import type { AutomationRule } from "../domain/aggregates/automation-rule/automation-rule.js";
import type { AutomationRuntime } from "../domain/services/automation-runtime.js";

/**
 * Mantém `ruleId → Subscription` em memória (`ADR-0041`) — permite
 * criar/ativar/desativar uma `AutomationRule` em runtime, via API, sem
 * reiniciar o processo. **Sem persistência de subscrição**: um restart do
 * processo perde todas as assinaturas — quem sobe o processo (`apps/api`)
 * precisa recarregar as regras do Postgres e chamar `activate()` de novo
 * para cada uma, mesma limitação já aceita para `InProcessEventBus`.
 */
export class AutomationRuleRegistry {
  private readonly subscriptions = new Map<string, Subscription>();

  constructor(private readonly runtime: AutomationRuntime) {}

  /** Idempotente: reativar uma regra já ativa não duplica a assinatura. */
  activate(rule: AutomationRule): void {
    this.deactivate(rule.id.toString());
    if (rule.enabled) {
      this.subscriptions.set(rule.id.toString(), this.runtime.register(rule));
    }
  }

  deactivate(ruleId: string): void {
    const subscription = this.subscriptions.get(ruleId);
    if (subscription) {
      this.runtime.unregister(subscription);
      this.subscriptions.delete(ruleId);
    }
  }
}
