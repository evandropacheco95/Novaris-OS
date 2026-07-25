import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Activity } from "../../../../domain/aggregates/activity/activity.js";
import { ActivityCreated } from "../../../../domain/events/activity-created.js";
import { ActivityCompleted } from "../../../../domain/events/activity-completed.js";

function buildCreateInput(overrides: Partial<Parameters<typeof Activity.create>[0]> = {}) {
  return {
    organizationId: new UniqueEntityId(),
    partyId: new UniqueEntityId(),
    type: "ligacao" as const,
    ...overrides,
  };
}

describe("Activity.create", () => {
  it("cria uma Activity válida no status \"open\"", () => {
    const input = buildCreateInput();
    const result = Activity.create(input);
    assert.equal(result.isSuccess, true);

    const activity = result.getValue()!;
    assert.equal(activity.organizationId.equals(input.organizationId), true);
    assert.equal(activity.partyId.equals(input.partyId), true);
    assert.equal(activity.type, "ligacao");
    assert.equal(activity.status, "open");
    assert.equal(activity.notes, undefined);
  });

  it("aceita notes opcional", () => {
    const activity = Activity.create(buildCreateInput({ notes: "Cliente pediu retorno amanhã" })).getValue()!;
    assert.equal(activity.notes, "Cliente pediu retorno amanhã");
  });

  it("aceita todos os tipos confirmados em ADR-0032", () => {
    const types = ["ligacao", "whatsapp", "email", "reuniao", "visita", "nota"] as const;
    for (const type of types) {
      const result = Activity.create(buildCreateInput({ type }));
      assert.equal(result.isSuccess, true);
      assert.equal(result.getValue()!.type, type);
    }
  });

  it("rejeita type fora da união conhecida", () => {
    const result = Activity.create(buildCreateInput({ type: "invalido" as never }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("dispara ActivityCreated na criação", () => {
    const activity = Activity.create(buildCreateInput()).getValue()!;
    assert.equal(activity.domainEvents.length, 1);
    const event = activity.domainEvents[0]!;
    assert.equal(event instanceof ActivityCreated, true);
    assert.equal(event.aggregateId.equals(activity.id), true);
    assert.equal(event.eventName, "ActivityCreated");
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => Activity.create(buildCreateInput()));
  });
});

describe("Activity.complete", () => {
  it("transiciona \"open\" → \"completed\" e dispara ActivityCompleted", () => {
    const activity = Activity.create(buildCreateInput()).getValue()!;
    const result = activity.complete();
    assert.equal(result.isSuccess, true);
    assert.equal(activity.status, "completed");

    assert.equal(activity.domainEvents.length, 2);
    const event = activity.domainEvents[1]!;
    assert.equal(event instanceof ActivityCompleted, true);
    assert.equal(event.aggregateId.equals(activity.id), true);
    assert.equal(event.eventName, "ActivityCompleted");
  });

  it("rejeita concluir uma Activity já concluída", () => {
    const activity = Activity.create(buildCreateInput()).getValue()!;
    activity.complete();
    const result = activity.complete();
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });
});

describe("Activity.reconstitute", () => {
  it("restaura uma Activity sem validar e sem disparar eventos", () => {
    const id = new UniqueEntityId();
    const now = new Date();
    const activity = Activity.reconstitute(
      {
        organizationId: new UniqueEntityId(),
        partyId: new UniqueEntityId(),
        type: "email",
        status: "completed",
        createdAt: now,
        updatedAt: now,
      },
      id,
    );
    assert.equal(activity.id.equals(id), true);
    assert.equal(activity.status, "completed");
    assert.equal(activity.domainEvents.length, 0);
  });
});
