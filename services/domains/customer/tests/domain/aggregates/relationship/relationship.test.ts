import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Relationship } from "../../../../domain/aggregates/relationship/relationship.js";
import { RelationshipCreated } from "../../../../domain/events/relationship-created.js";

function buildCreateInput(overrides: Partial<Parameters<typeof Relationship.create>[0]> = {}) {
  return {
    organizationId: new UniqueEntityId(),
    partyIdA: new UniqueEntityId(),
    partyIdB: new UniqueEntityId(),
    type: "cliente" as const,
    ...overrides,
  };
}

describe("Relationship.create", () => {
  it("cria um Relationship válido", () => {
    const input = buildCreateInput();
    const result = Relationship.create(input);
    assert.equal(result.isSuccess, true);

    const relationship = result.getValue()!;
    assert.equal(relationship.organizationId.equals(input.organizationId), true);
    assert.equal(relationship.partyIdA.equals(input.partyIdA), true);
    assert.equal(relationship.partyIdB.equals(input.partyIdB), true);
    assert.equal(relationship.type, "cliente");
  });

  it("aceita os 6 tipos nomeados em BOM.md", () => {
    const types = ["cliente", "fornecedor", "parceiro", "prospect", "investidor", "colaborador"] as const;
    for (const type of types) {
      const result = Relationship.create(buildCreateInput({ type }));
      assert.equal(result.isSuccess, true, `tipo "${type}" deveria ser aceito`);
    }
  });

  it("rejeita type fora da união conhecida", () => {
    const result = Relationship.create(buildCreateInput({ type: "invalido" as never }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita partyIdA igual a partyIdB", () => {
    const partyId = new UniqueEntityId();
    const result = Relationship.create(buildCreateInput({ partyIdA: partyId, partyIdB: partyId }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("dispara exatamente um RelationshipCreated com aggregateId igual ao id do Relationship", () => {
    const relationship = Relationship.create(buildCreateInput()).getValue()!;
    assert.equal(relationship.domainEvents.length, 1);
    const event = relationship.domainEvents[0]!;
    assert.equal(event instanceof RelationshipCreated, true);
    assert.equal(event.aggregateId.equals(relationship.id), true);
    assert.equal(event.eventName, "RelationshipCreated");
  });

  it("nunca lança exceção", () => {
    const partyId = new UniqueEntityId();
    assert.doesNotThrow(() => Relationship.create(buildCreateInput({ partyIdA: partyId, partyIdB: partyId })));
  });
});

describe("Relationship.reconstitute", () => {
  it("restaura um Relationship sem validar e sem disparar eventos", () => {
    const id = new UniqueEntityId();
    const now = new Date();
    const partyId = new UniqueEntityId();
    const relationship = Relationship.reconstitute(
      {
        organizationId: new UniqueEntityId(),
        partyIdA: partyId,
        partyIdB: partyId,
        type: "cliente",
        createdAt: now,
        updatedAt: now,
      },
      id,
    );
    assert.equal(relationship.id.equals(id), true);
    assert.equal(relationship.domainEvents.length, 0);
  });
});
