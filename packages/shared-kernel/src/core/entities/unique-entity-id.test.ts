import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "./unique-entity-id.js";

describe("UniqueEntityId", () => {
  it("gera um valor quando nenhum id é fornecido", () => {
    const id = new UniqueEntityId();
    assert.notEqual(id.toValue(), undefined);
    assert.notEqual(id.toValue(), "");
  });

  it("usa o id fornecido em vez de gerar um novo", () => {
    const id = new UniqueEntityId("fixed-id");
    assert.equal(id.toValue(), "fixed-id");
    assert.equal(id.toString(), "fixed-id");
  });

  it("é igual a outro UniqueEntityId com o mesmo valor", () => {
    const a = new UniqueEntityId("same-id");
    const b = new UniqueEntityId("same-id");
    assert.equal(a.equals(b), true);
  });

  it("não é igual a outro UniqueEntityId com valor diferente", () => {
    const a = new UniqueEntityId("id-a");
    const b = new UniqueEntityId("id-b");
    assert.equal(a.equals(b), false);
  });

  it("não é igual a undefined", () => {
    const a = new UniqueEntityId("id-a");
    assert.equal(a.equals(undefined), false);
  });

  it("gera valores diferentes para instâncias sem id explícito", () => {
    const a = new UniqueEntityId();
    const b = new UniqueEntityId();
    assert.equal(a.equals(b), false);
  });
});
