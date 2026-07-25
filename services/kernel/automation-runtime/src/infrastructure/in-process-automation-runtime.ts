import type { EventBus, Subscription } from "@novaris/event-bus";
import type { Logger } from "@novaris/logging";
import type { Notifier } from "@novaris/notifications";
import type { DomainEvent } from "@novaris/shared-kernel";
import type { AutomationRule, AutomationAction } from "../domain/aggregates/automation-rule/automation-rule.js";
import type { AutomationRuntime } from "../domain/services/automation-runtime.js";

/**
 * Adapter real do Port `AutomationRuntime` (`ADR-0041`) — cada `register()`
 * é uma assinatura real do `EventBus` (`InProcessEventBus`, `ADR-0037`).
 * Falha de uma action é isolada (`try/catch` por action, e o próprio
 * `EventBus` já isola falha de handler) — nunca derruba as demais actions da
 * mesma regra, nem outras regras assinando o mesmo evento.
 */
export class InProcessAutomationRuntime implements AutomationRuntime {
  constructor(
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
    private readonly notifier: Notifier,
  ) {}

  register(rule: AutomationRule): Subscription {
    return this.eventBus.subscribe(rule.triggerEventName, (event) => {
      for (const action of rule.actions) {
        this.executeAction(rule, action, event);
      }
    });
  }

  unregister(subscription: Subscription): void {
    this.eventBus.unsubscribe(subscription);
  }

  private executeAction(rule: AutomationRule, action: AutomationAction, event: DomainEvent): void {
    try {
      switch (action.type) {
        case "log":
          this.logger.info(`[automation-runtime] Regra "${rule.name}": ${action.message}`, {
            eventId: event.eventId,
            eventName: event.eventName,
          });
          return;
        case "notify":
          this.notifier.notify(action.recipientUserId, action.message, { eventId: event.eventId, rule: rule.name });
          return;
        case "webhook":
          fetch(action.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rule: rule.name,
              event: {
                eventId: event.eventId,
                eventName: event.eventName,
                aggregateId: event.aggregateId.toValue(),
                occurredAt: event.occurredAt,
              },
            }),
          }).catch((error: unknown) => {
            this.logger.error(`[automation-runtime] Webhook da regra "${rule.name}" falhou`, {
              url: action.url,
              error: error instanceof Error ? error.message : String(error),
            });
          });
          return;
      }
    } catch (error) {
      this.logger.error(`[automation-runtime] Ação da regra "${rule.name}" lançou exceção`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
