import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ValueObject } from "./value-object.js";

interface EmailProps extends Record<string, unknown> {
  value: string;
}

class Email extends ValueObject<EmailProps> {
  constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }
}

interface AddressProps extends Record<string, unknown> {
  street: string;
  nested: { zip: string };
}

class Address extends ValueObject<AddressProps> {
  constructor(props: AddressProps) {
    super(props);
  }
}

describe("ValueObject", () => {
  it("é igual a outro Value Object com as mesmas propriedades", () => {
    const a = new Email({ value: "a@novaris.dev" });
    const b = new Email({ value: "a@novaris.dev" });
    assert.equal(a.equals(b), true);
  });

  it("não é igual a outro Value Object com propriedades diferentes", () => {
    const a = new Email({ value: "a@novaris.dev" });
    const b = new Email({ value: "b@novaris.dev" });
    assert.equal(a.equals(b), false);
  });

  it("compara propriedades aninhadas por deep equality", () => {
    const a = new Address({ street: "Rua A", nested: { zip: "00000-000" } });
    const b = new Address({ street: "Rua A", nested: { zip: "00000-000" } });
    const c = new Address({ street: "Rua A", nested: { zip: "11111-111" } });
    assert.equal(a.equals(b), true);
    assert.equal(a.equals(c), false);
  });

  it("não é igual a undefined", () => {
    const a = new Email({ value: "a@novaris.dev" });
    assert.equal(a.equals(undefined), false);
  });

  it("é imutável — não permite alterar propriedades após a criação", () => {
    const a = new Email({ value: "a@novaris.dev" });
    assert.throws(() => {
      // @ts-expect-error "props" é protected — acesso direto aqui é só para confirmar o freeze em runtime
      a.props.value = "mutated@novaris.dev";
    });
  });
});
