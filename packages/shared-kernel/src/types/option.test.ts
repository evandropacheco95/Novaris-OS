import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Option } from "./option.js";

describe("Option", () => {
  it("representa valor presente (Some)", () => {
    const option = Option.some(42);
    assert.equal(option.isSome, true);
    assert.equal(option.isNone, false);
  });

  it("representa valor ausente (None), sem usar null", () => {
    const option = Option.none<number>();
    assert.equal(option.isNone, true);
    assert.equal(option.isSome, false);
  });

  it("getOrElse retorna o valor quando presente", () => {
    const option = Option.some(42);
    assert.equal(option.getOrElse(0), 42);
  });

  it("getOrElse retorna o fallback com segurança quando ausente", () => {
    const option = Option.none<number>();
    assert.equal(option.getOrElse(0), 0);
  });

  it("isSome/isNone são mutuamente exclusivos", () => {
    const some = Option.some("x");
    const none = Option.none<string>();
    assert.notEqual(some.isSome, some.isNone);
    assert.notEqual(none.isSome, none.isNone);
  });
});
