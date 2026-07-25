import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AppError } from "./app-error.js";
import { DomainError } from "./domain-error.js";
import type { AppErrorOptions } from "./app-error.js";

class TestDomainError extends DomainError {
  constructor(message: string, options?: AppErrorOptions) {
    super("TEST_DOMAIN_ERROR", message, options);
  }
}

describe("DomainError", () => {
  it("herda de AppError e de Error", () => {
    const error = new TestDomainError("falhou");
    assert.equal(error instanceof DomainError, true);
    assert.equal(error instanceof AppError, true);
    assert.equal(error instanceof Error, true);
  });

  it("propaga code/message/details/metadata/cause via AppError", () => {
    const cause = new Error("raiz");
    const error = new TestDomainError("falhou", { details: { x: 1 }, metadata: { y: 2 }, cause });
    assert.equal(error.code, "TEST_DOMAIN_ERROR");
    assert.equal(error.message, "falhou");
    assert.deepEqual(error.details, { x: 1 });
    assert.deepEqual(error.metadata, { y: 2 });
    assert.equal(error.cause, cause);
  });
});
