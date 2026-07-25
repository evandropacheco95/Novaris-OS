import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainEvent } from "@novaris/shared-kernel";
import { InProcessEventBus } from "../../src/infrastructure/in-process-event-bus.js";

class FakeEvent implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName: string;

  constructor(eventName: string, aggregateId = new UniqueEntityId()) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
    this.eventName = eventName;
  }
}

describe("InProcessEventBus", () => {
  const originalError = console.error;

  afterEach(() => {
    console.error = originalError;
  });

  it("entrega o evento a um Subscriber inscrito no mesmo eventType", () => {
    const bus = new InProcessEventBus();
    const received: DomainEvent[] = [];
    bus.subscribe("TestEvent", (event) => received.push(event));

    const event = new FakeEvent("TestEvent");
    bus.publish(event);

    assert.equal(received.length, 1);
    assert.equal(received[0], event);
  });

  it("não entrega o evento a um Subscriber de outro eventType", () => {
    const bus = new InProcessEventBus();
    const received: DomainEvent[] = [];
    bus.subscribe("OutroEvento", (event) => received.push(event));

    bus.publish(new FakeEvent("TestEvent"));

    assert.equal(received.length, 0);
  });

  it("entrega o evento a múltiplos Subscribers do mesmo eventType", () => {
    const bus = new InProcessEventBus();
    let countA = 0;
    let countB = 0;
    bus.subscribe("TestEvent", () => {
      countA += 1;
    });
    bus.subscribe("TestEvent", () => {
      countB += 1;
    });

    bus.publish(new FakeEvent("TestEvent"));

    assert.equal(countA, 1);
    assert.equal(countB, 1);
  });

  it("publish sem nenhum Subscriber não lança erro", () => {
    const bus = new InProcessEventBus();
    assert.doesNotThrow(() => bus.publish(new FakeEvent("SemSubscriber")));
  });

  it("unsubscribe interrompe a entrega para aquele Subscriber", () => {
    const bus = new InProcessEventBus();
    let count = 0;
    const subscription = bus.subscribe("TestEvent", () => {
      count += 1;
    });

    bus.publish(new FakeEvent("TestEvent"));
    bus.unsubscribe(subscription);
    bus.publish(new FakeEvent("TestEvent"));

    assert.equal(count, 1);
  });

  it("um Subscriber que lança exceção não impede os demais de rodar", () => {
    console.error = () => {};

    const bus = new InProcessEventBus();
    let secondRan = false;
    bus.subscribe("TestEvent", () => {
      throw new Error("subscriber quebrado");
    });
    bus.subscribe("TestEvent", () => {
      secondRan = true;
    });

    assert.doesNotThrow(() => bus.publish(new FakeEvent("TestEvent")));
    assert.equal(secondRan, true);
  });
});
