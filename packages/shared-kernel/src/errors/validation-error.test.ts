import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AppError } from "./app-error.js";
import { DomainError } from "./domain-error.js";
import { ValidationError } from "./validation-error.js";

describe("ValidationError", () => {
  it("tem o código fixo VALIDATION_ERROR", () => {
    const error = new ValidationError("campo inválido");
    assert.equal(error.code, "VALIDATION_ERROR");
  });

  it("é instanceof ValidationError, DomainError, AppError e Error", () => {
    const error = new ValidationError("campo inválido");
    assert.equal(error instanceof ValidationError, true);
    assert.equal(error instanceof DomainError, true);
    assert.equal(error instanceof AppError, true);
    assert.equal(error instanceof Error, true);
  });

  it("preserva message, details, metadata e cause", () => {
    const cause = new Error("raiz");
    const error = new ValidationError("email inválido", {
      details: { field: "email" },
      metadata: { requestId: "req-1" },
      cause,
    });
    assert.equal(error.message, "email inválido");
    assert.deepEqual(error.details, { field: "email" });
    assert.deepEqual(error.metadata, { requestId: "req-1" });
    assert.equal(error.cause, cause);
  });

  it("serializa via toJSON", () => {
    const error = new ValidationError("email inválido");
    assert.equal(error.toJSON().code, "VALIDATION_ERROR");
  });
});
