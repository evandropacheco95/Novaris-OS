import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Party } from "../../../../domain/aggregates/party/party.js";

function buildCreateInput(overrides: Partial<Parameters<typeof Party.create>[0]> = {}) {
  return {
    organizationId: new UniqueEntityId(),
    partyType: "person" as const,
    name: "Fulano de Tal",
    ...overrides,
  };
}

describe("Party.create", () => {
  it("cria uma Party válida do tipo person", () => {
    const input = buildCreateInput();
    const result = Party.create(input);
    assert.equal(result.isSuccess, true);

    const party = result.getValue()!;
    assert.equal(party.organizationId.equals(input.organizationId), true);
    assert.equal(party.partyType, "person");
    assert.equal(party.name, "Fulano de Tal");
    assert.equal(party.document, undefined);
  });

  it("cria uma Party válida do tipo external_organization, com document", () => {
    const party = Party.create(buildCreateInput({ partyType: "external_organization", name: "Acme Ltda", document: "00.000.000/0001-00" })).getValue()!;
    assert.equal(party.partyType, "external_organization");
    assert.equal(party.document, "00.000.000/0001-00");
  });

  it("rejeita partyType fora da união conhecida", () => {
    const result = Party.create(buildCreateInput({ partyType: "invalido" as never }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita name vazio", () => {
    const result = Party.create(buildCreateInput({ name: "" }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita name só com espaços", () => {
    const result = Party.create(buildCreateInput({ name: "   " }));
    assert.equal(result.isFailure, true);
  });

  it("não dispara nenhum Domain Event (PartyCreated não confirmado)", () => {
    const party = Party.create(buildCreateInput()).getValue()!;
    assert.equal(party.domainEvents.length, 0);
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => Party.create(buildCreateInput({ name: "" })));
  });
});

describe("Party.reconstitute", () => {
  it("restaura uma Party sem validar e sem disparar eventos", () => {
    const id = new UniqueEntityId();
    const now = new Date();
    const party = Party.reconstitute(
      {
        organizationId: new UniqueEntityId(),
        partyType: "person",
        name: "Restaurado",
        document: undefined,
        createdAt: now,
        updatedAt: now,
      },
      id,
    );
    assert.equal(party.id.equals(id), true);
    assert.equal(party.domainEvents.length, 0);
  });
});
