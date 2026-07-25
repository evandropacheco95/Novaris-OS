import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { AggregateRoot } from "./aggregate-root.js";
import { Entity } from "../entities/entity.js";
import { UniqueEntityId } from "../entities/unique-entity-id.js";
import type { DomainEvent } from "../domain-events/domain-event.js";

interface TestProps {
  name: string;
}

class TestAggregate extends AggregateRoot<TestProps> {
  constructor(props: TestProps) {
    super(props);
  }

  raise(event: DomainEvent): void {
    this.addDomainEvent(event);
  }

  discard(event: DomainEvent): void {
    this.removeDomainEvent(event);
  }
}

function createTestEvent(aggregateId: UniqueEntityId, eventName: string): DomainEvent {
  return {
    eventId: randomUUID(),
    aggregateId,
    occurredAt: new Date(),
    eventName,
  };
}

describe("AggregateRoot", () => {
  it("herda de Entity — igualdade por identidade e id acessível", () => {
    const aggregate = new TestAggregate({ name: "A" });
    assert.equal(aggregate instanceof Entity, true);
    assert.notEqual(aggregate.id, undefined);
  });

  it("começa sem nenhum domain event", () => {
    const aggregate = new TestAggregate({ name: "A" });
    assert.deepEqual(aggregate.domainEvents, []);
  });

  it("adiciona um DomainEvent tipado à coleção interna", () => {
    const aggregate = new TestAggregate({ name: "A" });
    const event = createTestEvent(aggregate.id, "TestEventOccurred");
    aggregate.raise(event);
    assert.equal(aggregate.domainEvents.length, 1);
    assert.equal(aggregate.domainEvents[0], event);
    assert.equal(aggregate.domainEvents[0]?.aggregateId.equals(aggregate.id), true);
  });

  it("remove um domain event específico da coleção interna", () => {
    const aggregate = new TestAggregate({ name: "A" });
    const eventA = createTestEvent(aggregate.id, "A");
    const eventB = createTestEvent(aggregate.id, "B");
    aggregate.raise(eventA);
    aggregate.raise(eventB);
    aggregate.discard(eventA);
    assert.equal(aggregate.domainEvents.length, 1);
    assert.equal(aggregate.domainEvents[0], eventB);
  });

  it("limpa toda a coleção de domain events", () => {
    const aggregate = new TestAggregate({ name: "A" });
    aggregate.raise(createTestEvent(aggregate.id, "A"));
    aggregate.raise(createTestEvent(aggregate.id, "B"));
    aggregate.clearEvents();
    assert.deepEqual(aggregate.domainEvents, []);
  });

  it("não expõe Event Bus nem método de publicação", () => {
    const aggregate = new TestAggregate({ name: "A" });
    assert.equal((aggregate as unknown as { publish?: unknown }).publish, undefined);
    assert.equal((aggregate as unknown as { eventBus?: unknown }).eventBus, undefined);
    assert.equal((aggregate as unknown as { dispatch?: unknown }).dispatch, undefined);
  });

  it("nunca publica automaticamente ao adicionar um evento — a coleção só cresce por chamada explícita", () => {
    const aggregate = new TestAggregate({ name: "A" });
    assert.equal(aggregate.domainEvents.length, 0);
    aggregate.raise(createTestEvent(aggregate.id, "TestEventOccurred"));
    assert.equal(aggregate.domainEvents.length, 1);
  });
});
