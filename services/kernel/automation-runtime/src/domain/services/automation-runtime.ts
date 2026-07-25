import type { Subscription } from "@novaris/event-bus";
import type { AutomationRule } from "../aggregates/automation-rule/automation-rule.js";

/**
 * Port do motor de automação (`ADR-0041`, inspirado no Salesforce Flow) —
 * registra uma `AutomationRule` como um Subscriber real do Event Bus
 * (`ADR-0037`). `Subscription` é o mesmo tipo devolvido por
 * `EventBus.subscribe()` — `automation-runtime` não inventa um mecanismo de
 * assinatura próprio, reaproveita o que já existe.
 */
export interface AutomationRuntime {
  register(rule: AutomationRule): Subscription;
  unregister(subscription: Subscription): void;
}
