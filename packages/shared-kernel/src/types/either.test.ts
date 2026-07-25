import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Either } from "./either.js";

describe("Either", () => {
  it("representa o lado esquerdo (left)", () => {
    const either = Either.left<string, number>("erro");
    assert.equal(either.isLeft, true);
    assert.equal(either.isRight, false);
    assert.equal(either.getLeft(), "erro");
  });

  it("representa o lado direito (right)", () => {
    const either = Either.right<string, number>(42);
    assert.equal(either.isRight, true);
    assert.equal(either.isLeft, false);
    assert.equal(either.getRight(), 42);
  });

  it("acesso seguro ao lado inativo retorna undefined", () => {
    const left = Either.left<string, number>("erro");
    const right = Either.right<string, number>(42);
    assert.equal(left.getRight(), undefined);
    assert.equal(right.getLeft(), undefined);
  });

  it("consulta de estado (isLeft/isRight) é mutuamente exclusiva", () => {
    const left = Either.left<string, number>("erro");
    const right = Either.right<string, number>(42);
    assert.notEqual(left.isLeft, left.isRight);
    assert.notEqual(right.isLeft, right.isRight);
  });
});
