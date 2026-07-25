import type { DomainEvent } from "@novaris/shared-kernel";

/**
 * Port de Event Bus (`ENGINEERING_PLAYBOOK.md § 9` — toda Port é uma
 * interface TypeScript). Assinatura já congelada desde a Missão ARCH-001
 * (`CONTRACT.md`) — esta interface não muda a forma, só deixa de ser
 * "apenas assinatura" (`ADR-0037`).
 */
export type EventHandler = (event: DomainEvent) => void;

export interface Subscription {
  readonly eventType: string;
  readonly handler: EventHandler;
}

export interface EventBus {
  publish(event: DomainEvent): void;
  subscribe(eventType: string, handler: EventHandler): Subscription;
  unsubscribe(subscription: Subscription): void;
}
