import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AppError } from "./app-error.js";
import { DomainError } from "./domain-error.js";
import { UnexpectedError } from "./unexpected-error.js";

describe("UnexpectedError", () => {
  it("tem o código fixo UNEXPECTED_ERROR", () => {
    const error = new UnexpectedError("falha não antecipada");
    assert.equal(error.code, "UNEXPECTED_ERROR");
  });

  it("é instanceof UnexpectedError e AppError, mas NÃO DomainError", () => {
    const error = new UnexpectedError("falha não antecipada");
    assert.equal(error instanceof UnexpectedError, true);
    assert.equal(error instanceof AppError, true);
    assert.equal(error instanceof Error, true);
    assert.equal(error instanceof DomainError, false);
  });

  it("preserva message, details, metadata e cause", () => {
    const cause = new Error("stack trace original");
    const error = new UnexpectedError("falha não antecipada", {
      details: { source: "worker" },
      metadata: { pid: 1234 },
      cause,
    });
    assert.equal(error.message, "falha não antecipada");
    assert.deepEqual(error.details, { source: "worker" });
    assert.deepEqual(error.metadata, { pid: 1234 });
    assert.equal(error.cause, cause);
  });

  it("serializa via toJSON", () => {
    const error = new UnexpectedError("falha não antecipada");
    assert.equal(error.toJSON().code, "UNEXPECTED_ERROR");
  });
});
