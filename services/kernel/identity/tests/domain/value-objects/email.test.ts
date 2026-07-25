import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ValidationError } from "@novaris/shared-kernel";
import { Email } from "../../../src/domain/value-objects/email.js";

describe("Email", () => {
  it("cria um Email válido", () => {
    const result = Email.create("user@novaris.dev");
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()?.value, "user@novaris.dev");
  });

  it("normaliza para minúsculas", () => {
    const result = Email.create("User@NOVARIS.dev");
    assert.equal(result.getValue()?.value, "user@novaris.dev");
  });

  it("remove espaços nas bordas", () => {
    const result = Email.create("  user@novaris.dev  ");
    assert.equal(result.getValue()?.value, "user@novaris.dev");
  });

  it("rejeita um email sem @", () => {
    const result = Email.create("user.novaris.dev");
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("rejeita um email sem domínio", () => {
    const result = Email.create("user@");
    assert.equal(result.isFailure, true);
  });

  it("rejeita string vazia", () => {
    const result = Email.create("");
    assert.equal(result.isFailure, true);
  });

  it("é imutável — instâncias com o mesmo valor (após normalização) são iguais", () => {
    const a = Email.create("user@novaris.dev").getValue();
    const b = Email.create("USER@novaris.dev").getValue();
    assert.equal(a?.equals(b), true);
  });

  it("nunca lança exceção — retorna Result mesmo para entrada inválida", () => {
    assert.doesNotThrow(() => Email.create("not-an-email"));
  });
});
