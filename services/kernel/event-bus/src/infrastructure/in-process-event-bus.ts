import type { DomainEvent } from "@novaris/shared-kernel";
import type { EventBus, EventHandler, Subscription } from "../domain/ports/event-bus.js";

/**
 * Adapter real do Port `EventBus` — in-process, síncrono, sem broker externo
 * (`ADR-0037`: um único processo Node hoje não justifica mensageria
 * cross-processo). `eventName` de `DomainEvent` é usado como `eventType`.
 *
 * Falha de um Subscriber é isolada por `try/catch` — não interrompe os
 * demais Subscribers nem propaga para quem chamou `publish()` (`ADR-0037
 * § Decision`, resolve `CONTRACT.md § Erros`). O fallback usa `console.error`
 * direto, não `@novaris/logging` — `logging`/`event-bus` são deliberadamente
 * não-dependentes entre si (`IMPLEMENTATION_ROADMAP.md § 7`); um chamador que
 * queira observabilidade estruturada real registra seu próprio Subscriber
 * logging-aware (ver `apps/api/src/main.ts`).
 */
export class InProcessEventBus implements EventBus {
  private readonly handlersByType = new Map<string, Set<EventHandler>>();

  publish(event: DomainEvent): void {
    const handlers = this.handlersByType.get(event.eventName);
    if (!handlers || handlers.size === 0) {
      return;
    }
    for (const handler of handlers) {
      try {
        handler(event);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          `[event-bus] Subscriber falhou ao processar "${event.eventName}" (eventId=${event.eventId}):`,
          error instanceof Error ? error.message : error,
        );
      }
    }
  }

  subscribe(eventType: string, handler: EventHandler): Subscription {
    const existing = this.handlersByType.get(eventType);
    if (existing) {
      existing.add(handler);
    } else {
      this.handlersByType.set(eventType, new Set([handler]));
    }
    return { eventType, handler };
  }

  unsubscribe(subscription: Subscription): void {
    this.handlersByType.get(subscription.eventType)?.delete(subscription.handler);
  }
}
