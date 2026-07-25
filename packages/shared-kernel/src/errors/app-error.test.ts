import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AppError, type AppErrorOptions } from "./app-error.js";

class TestAppError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super("TEST_APP_ERROR", message, options);
  }
}

describe("AppError", () => {
  it("estende Error nativo", () => {
    const error = new TestAppError("falhou");
    assert.equal(error instanceof Error, true);
  });

  it("expõe code, message, details, metadata e cause explicitamente tipados", () => {
    const cause = new Error("causa raiz");
    const error = new TestAppError("falhou", {
      details: { field: "email" },
      metadata: { requestId: "req-1" },
      cause,
    });
    assert.equal(error.code, "TEST_APP_ERROR");
    assert.equal(error.message, "falhou");
    assert.deepEqual(error.details, { field: "email" });
    assert.deepEqual(error.metadata, { requestId: "req-1" });
    assert.equal(error.cause, cause);
  });

  it("details/metadata/cause são undefined quando não fornecidos", () => {
    const error = new TestAppError("falhou");
    assert.equal(error.details, undefined);
    assert.equal(error.metadata, undefined);
    assert.equal(error.cause, undefined);
  });

  it("name reflete o nome da subclasse concreta", () => {
    const error = new TestAppError("falhou");
    assert.equal(error.name, "TestAppError");
  });

  it("serializa via toJSON com os campos esperados", () => {
    const error = new TestAppError("falhou", { details: { a: 1 } });
    const json = error.toJSON();
    assert.equal(json.name, "TestAppError");
    assert.equal(json.code, "TEST_APP_ERROR");
    assert.equal(json.message, "falhou");
    assert.deepEqual(json.details, { a: 1 });
  });

  it("JSON.stringify usa toJSON automaticamente", () => {
    const error = new TestAppError("falhou");
    const serialized = JSON.parse(JSON.stringify(error));
    assert.equal(serialized.code, "TEST_APP_ERROR");
    assert.equal(serialized.message, "falhou");
  });
});
