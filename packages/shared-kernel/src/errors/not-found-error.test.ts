import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AppError } from "./app-error.js";
import { DomainError } from "./domain-error.js";
import { NotFoundError } from "./not-found-error.js";

describe("NotFoundError", () => {
  it("tem o código fixo NOT_FOUND_ERROR", () => {
    const error = new NotFoundError("não encontrado");
    assert.equal(error.code, "NOT_FOUND_ERROR");
  });

  it("é instanceof NotFoundError, DomainError, AppError e Error", () => {
    const error = new NotFoundError("não encontrado");
    assert.equal(error instanceof NotFoundError, true);
    assert.equal(error instanceof DomainError, true);
    assert.equal(error instanceof AppError, true);
    assert.equal(error instanceof Error, true);
  });

  it("preserva message, details, metadata e cause", () => {
    const cause = new Error("raiz");
    const error = new NotFoundError("organização não encontrada", {
      details: { id: "org-1" },
      metadata: { requestId: "req-1" },
      cause,
    });
    assert.equal(error.message, "organização não encontrada");
    assert.deepEqual(error.details, { id: "org-1" });
    assert.deepEqual(error.metadata, { requestId: "req-1" });
    assert.equal(error.cause, cause);
  });

  it("serializa via toJSON", () => {
    const error = new NotFoundError("não encontrado");
    assert.equal(error.toJSON().code, "NOT_FOUND_ERROR");
  });
});
