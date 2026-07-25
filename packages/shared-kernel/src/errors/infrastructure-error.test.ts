import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AppError } from "./app-error.js";
import { DomainError } from "./domain-error.js";
import { InfrastructureError } from "./infrastructure-error.js";

describe("InfrastructureError", () => {
  it("tem o código fixo INFRASTRUCTURE_ERROR", () => {
    const error = new InfrastructureError("banco indisponível");
    assert.equal(error.code, "INFRASTRUCTURE_ERROR");
  });

  it("é instanceof InfrastructureError e AppError, mas NÃO DomainError", () => {
    const error = new InfrastructureError("banco indisponível");
    assert.equal(error instanceof InfrastructureError, true);
    assert.equal(error instanceof AppError, true);
    assert.equal(error instanceof Error, true);
    assert.equal(error instanceof DomainError, false);
  });

  it("preserva message, details, metadata e cause", () => {
    const cause = new Error("connection refused");
    const error = new InfrastructureError("banco indisponível", {
      details: { host: "db.internal" },
      metadata: { retry: 3 },
      cause,
    });
    assert.equal(error.message, "banco indisponível");
    assert.deepEqual(error.details, { host: "db.internal" });
    assert.deepEqual(error.metadata, { retry: 3 });
    assert.equal(error.cause, cause);
  });

  it("serializa via toJSON", () => {
    const error = new InfrastructureError("banco indisponível");
    assert.equal(error.toJSON().code, "INFRASTRUCTURE_ERROR");
  });
});
