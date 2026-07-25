import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Result } from "./result.js";

describe("Result", () => {
  it("representa sucesso com isSuccess/isFailure corretos", () => {
    const result = Result.ok<number, string>(42);
    assert.equal(result.isSuccess, true);
    assert.equal(result.isFailure, false);
  });

  it("representa falha com isSuccess/isFailure corretos", () => {
    const result = Result.fail<number, string>("deu erro");
    assert.equal(result.isSuccess, false);
    assert.equal(result.isFailure, true);
  });

  it("acesso seguro ao valor em caso de sucesso", () => {
    const result = Result.ok<number, string>(42);
    assert.equal(result.getValue(), 42);
    assert.equal(result.getError(), undefined);
  });

  it("acesso seguro ao erro em caso de falha", () => {
    const result = Result.fail<number, string>("deu erro");
    assert.equal(result.getError(), "deu erro");
    assert.equal(result.getValue(), undefined);
  });

  it("nunca lança exceção ao consultar valor/erro no estado errado", () => {
    const success = Result.ok<number, string>(1);
    const failure = Result.fail<number, string>("x");
    assert.doesNotThrow(() => success.getError());
    assert.doesNotThrow(() => failure.getValue());
  });
});
