import { Entity } from "../entities/entity.js";
import type { DomainEvent } from "../domain-events/domain-event.js";

/**
 * Classe base para todos os Aggregates. Herda Entity<T> e mantém a coleção
 * interna de Domain Events (add/remove/clear) — não implementa Event Bus nem
 * publica eventos. `DomainEvent` (Missão ENG-0001.5) substitui o placeholder
 * `unknown` usado até a Missão ENG-0001.2.
 */
export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  protected removeDomainEvent(event: DomainEvent): void {
    this._domainEvents = this._domainEvents.filter((existing) => existing !== event);
  }

  clearEvents(): void {
    this._domainEvents = [];
  }
}
