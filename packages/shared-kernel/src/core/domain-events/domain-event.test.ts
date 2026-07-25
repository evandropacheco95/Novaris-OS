import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { DomainEvent } from "./domain-event.js";
import { UniqueEntityId } from "../entities/unique-entity-id.js";
import { AggregateRoot } from "../aggregate-roots/aggregate-root.js";

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
}

describe("DomainEvent", () => {
  it("um objeto plano que satisfaz a forma do contrato é aceito onde DomainEvent é esperado", () => {
    const event: DomainEvent = {
      eventId: randomUUID(),
      aggregateId: new UniqueEntityId(),
      occurredAt: new Date(),
      eventName: "TestEventOccurred",
    };
    assert.equal(typeof event.eventId, "string");
    assert.equal(event.aggregateId instanceof UniqueEntityId, true);
    assert.equal(event.occurredAt instanceof Date, true);
    assert.equal(typeof event.eventName, "string");
  });

  it("todos os 4 campos exigidos são explicitamente tipados e presentes", () => {
    const event: DomainEvent = {
      eventId: "event-1",
      aggregateId: new UniqueEntityId("agg-1"),
      occurredAt: new Date("2026-07-15T00:00:00.000Z"),
      eventName: "OrganizationCreated",
    };
    assert.deepEqual(Object.keys(event).sort(), [
      "aggregateId",
      "eventId",
      "eventName",
      "occurredAt",
    ]);
  });

  it("integra com AggregateRoot: um evento concreto é aceito e armazenado tipado", () => {
    const aggregate = new TestAggregate({ name: "A" });
    const event: DomainEvent = {
      eventId: randomUUID(),
      aggregateId: aggregate.id,
      occurredAt: new Date(),
      eventName: "TestEventOccurred",
    };
    aggregate.raise(event);
    assert.equal(aggregate.domainEvents.length, 1);
    assert.equal(aggregate.domainEvents[0]?.eventName, "TestEventOccurred");
  });

  it("aggregateId de um evento pode ser comparado por valor ao id do aggregate de origem", () => {
    const aggregate = new TestAggregate({ name: "A" });
    const event: DomainEvent = {
      eventId: randomUUID(),
      aggregateId: aggregate.id,
      occurredAt: new Date(),
      eventName: "TestEventOccurred",
    };
    assert.equal(event.aggregateId.equals(aggregate.id), true);
  });
});
