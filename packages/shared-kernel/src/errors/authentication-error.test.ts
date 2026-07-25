import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AppError } from "./app-error.js";
import { DomainError } from "./domain-error.js";
import { AuthenticationError } from "./authentication-error.js";

describe("AuthenticationError", () => {
  it("tem o código fixo AUTHENTICATION_ERROR", () => {
    const error = new AuthenticationError("credenciais inválidas");
    assert.equal(error.code, "AUTHENTICATION_ERROR");
  });

  it("é instanceof AuthenticationError, DomainError, AppError e Error", () => {
    const error = new AuthenticationError("credenciais inválidas");
    assert.equal(error instanceof AuthenticationError, true);
    assert.equal(error instanceof DomainError, true);
    assert.equal(error instanceof AppError, true);
    assert.equal(error instanceof Error, true);
  });

  it("preserva message, details, metadata e cause", () => {
    const cause = new Error("raiz");
    const error = new AuthenticationError("token expirado", {
      details: { reason: "expired" },
      metadata: { sessionId: "sess-1" },
      cause,
    });
    assert.equal(error.message, "token expirado");
    assert.deepEqual(error.details, { reason: "expired" });
    assert.deepEqual(error.metadata, { sessionId: "sess-1" });
    assert.equal(error.cause, cause);
  });

  it("serializa via toJSON", () => {
    const error = new AuthenticationError("credenciais inválidas");
    assert.equal(error.toJSON().code, "AUTHENTICATION_ERROR");
  });
});
