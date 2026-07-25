import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AppError } from "./app-error.js";
import { DomainError } from "./domain-error.js";
import { ConflictError } from "./conflict-error.js";

describe("ConflictError", () => {
  it("tem o código fixo CONFLICT_ERROR", () => {
    const error = new ConflictError("já existe");
    assert.equal(error.code, "CONFLICT_ERROR");
  });

  it("é instanceof ConflictError, DomainError, AppError e Error", () => {
    const error = new ConflictError("já existe");
    assert.equal(error instanceof ConflictError, true);
    assert.equal(error instanceof DomainError, true);
    assert.equal(error instanceof AppError, true);
    assert.equal(error instanceof Error, true);
  });

  it("preserva message, details, metadata e cause", () => {
    const cause = new Error("raiz");
    const error = new ConflictError("email já cadastrado", {
      details: { field: "email" },
      metadata: { organizationId: "org-1" },
      cause,
    });
    assert.equal(error.message, "email já cadastrado");
    assert.deepEqual(error.details, { field: "email" });
    assert.deepEqual(error.metadata, { organizationId: "org-1" });
    assert.equal(error.cause, cause);
  });

  it("serializa via toJSON", () => {
    const error = new ConflictError("já existe");
    assert.equal(error.toJSON().code, "CONFLICT_ERROR");
  });
});
