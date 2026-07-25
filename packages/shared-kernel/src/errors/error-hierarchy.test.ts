import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AppError } from "./app-error.js";
import { DomainError } from "./domain-error.js";
import { ValidationError } from "./validation-error.js";
import { BusinessRuleError } from "./business-rule-error.js";
import { AuthorizationError } from "./authorization-error.js";
import { AuthenticationError } from "./authentication-error.js";
import { ConflictError } from "./conflict-error.js";
import { NotFoundError } from "./not-found-error.js";
import { InfrastructureError } from "./infrastructure-error.js";
import { UnexpectedError } from "./unexpected-error.js";
import { Result } from "../types/result.js";

const domainErrors = [
  new ValidationError("x"),
  new BusinessRuleError("x"),
  new AuthorizationError("x"),
  new AuthenticationError("x"),
  new ConflictError("x"),
  new NotFoundError("x"),
];

const rootLevelErrors = [new InfrastructureError("x"), new UnexpectedError("x")];

describe("Hierarquia de erros — cruzada", () => {
  it("os 6 erros de domínio são instanceof DomainError e AppError", () => {
    for (const error of domainErrors) {
      assert.equal(error instanceof DomainError, true);
      assert.equal(error instanceof AppError, true);
    }
  });

  it("InfrastructureError e UnexpectedError são instanceof AppError mas NÃO DomainError", () => {
    for (const error of rootLevelErrors) {
      assert.equal(error instanceof AppError, true);
      assert.equal(error instanceof DomainError, false);
    }
  });

  it("todos os 10 códigos são únicos", () => {
    const all = [...domainErrors, ...rootLevelErrors];
    const codes = all.map((error) => error.code);
    assert.equal(new Set(codes).size, codes.length);
  });

  it("todos os 10 tipos são instanceof Error", () => {
    const all = [...domainErrors, ...rootLevelErrors];
    for (const error of all) {
      assert.equal(error instanceof Error, true);
    }
  });

  it("é compatível com Result<T, E> como tipo de erro", () => {
    const failure = Result.fail<number, DomainError>(new NotFoundError("organização não encontrada"));
    assert.equal(failure.isFailure, true);
    assert.equal(failure.getError()?.code, "NOT_FOUND_ERROR");
    assert.equal(failure.getError() instanceof DomainError, true);

    const success = Result.ok<number, DomainError>(42);
    assert.equal(success.isSuccess, true);
    assert.equal(success.getValue(), 42);
  });
});
