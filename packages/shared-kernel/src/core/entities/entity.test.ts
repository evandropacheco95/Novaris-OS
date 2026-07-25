import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Entity } from "./entity.js";
import { UniqueEntityId } from "./unique-entity-id.js";

interface TestProps {
  name: string;
}

class TestEntity extends Entity<TestProps> {
  constructor(props: TestProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }
}

describe("Entity", () => {
  it("expõe um id gerado quando nenhum é fornecido", () => {
    const entity = new TestEntity({ name: "A" });
    assert.notEqual(entity.id, undefined);
  });

  it("usa o id fornecido explicitamente", () => {
    const id = new UniqueEntityId("fixed-id");
    const entity = new TestEntity({ name: "A" }, id);
    assert.equal(entity.id.equals(id), true);
  });

  it("é igual a outra entidade com o mesmo id, mesmo com props diferentes", () => {
    const id = new UniqueEntityId("shared-id");
    const a = new TestEntity({ name: "A" }, id);
    const b = new TestEntity({ name: "B" }, id);
    assert.equal(a.equals(b), true);
  });

  it("não é igual a outra entidade com id diferente, mesmo com props iguais", () => {
    const a = new TestEntity({ name: "A" }, new UniqueEntityId("id-a"));
    const b = new TestEntity({ name: "A" }, new UniqueEntityId("id-b"));
    assert.equal(a.equals(b), false);
  });

  it("não é igual a undefined", () => {
    const a = new TestEntity({ name: "A" });
    assert.equal(a.equals(undefined), false);
  });

  it("é igual a si mesma (mesma referência)", () => {
    const a = new TestEntity({ name: "A" });
    assert.equal(a.equals(a), true);
  });
});
