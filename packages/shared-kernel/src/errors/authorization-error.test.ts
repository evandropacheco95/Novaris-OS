import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AppError } from "./app-error.js";
import { DomainError } from "./domain-error.js";
import { AuthorizationError } from "./authorization-error.js";

describe("AuthorizationError", () => {
  it("tem o código fixo AUTHORIZATION_ERROR", () => {
    const error = new AuthorizationError("sem permissão");
    assert.equal(error.code, "AUTHORIZATION_ERROR");
  });

  it("é instanceof AuthorizationError, DomainError, AppError e Error", () => {
    const error = new AuthorizationError("sem permissão");
    assert.equal(error instanceof AuthorizationError, true);
    assert.equal(error instanceof DomainError, true);
    assert.equal(error instanceof AppError, true);
    assert.equal(error instanceof Error, true);
  });

  it("preserva message, details, metadata e cause", () => {
    const cause = new Error("raiz");
    const error = new AuthorizationError("papel insuficiente", {
      details: { requiredRole: "admin" },
      metadata: { userId: "user-1" },
      cause,
    });
    assert.equal(error.message, "papel insuficiente");
    assert.deepEqual(error.details, { requiredRole: "admin" });
    assert.deepEqual(error.metadata, { userId: "user-1" });
    assert.equal(error.cause, cause);
  });

  it("serializa via toJSON", () => {
    const error = new AuthorizationError("sem permissão");
    assert.equal(error.toJSON().code, "AUTHORIZATION_ERROR");
  });
});
