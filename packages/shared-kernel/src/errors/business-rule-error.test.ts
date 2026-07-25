import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AppError } from "./app-error.js";
import { DomainError } from "./domain-error.js";
import { BusinessRuleError } from "./business-rule-error.js";

describe("BusinessRuleError", () => {
  it("tem o código fixo BUSINESS_RULE_ERROR", () => {
    const error = new BusinessRuleError("regra violada");
    assert.equal(error.code, "BUSINESS_RULE_ERROR");
  });

  it("é instanceof BusinessRuleError, DomainError, AppError e Error", () => {
    const error = new BusinessRuleError("regra violada");
    assert.equal(error instanceof BusinessRuleError, true);
    assert.equal(error instanceof DomainError, true);
    assert.equal(error instanceof AppError, true);
    assert.equal(error instanceof Error, true);
  });

  it("preserva message, details, metadata e cause", () => {
    const cause = new Error("raiz");
    const error = new BusinessRuleError("organização inativa não pode ativar usuário", {
      details: { rule: "organization-must-be-active" },
      metadata: { organizationId: "org-1" },
      cause,
    });
    assert.equal(error.message, "organização inativa não pode ativar usuário");
    assert.deepEqual(error.details, { rule: "organization-must-be-active" });
    assert.deepEqual(error.metadata, { organizationId: "org-1" });
    assert.equal(error.cause, cause);
  });

  it("serializa via toJSON", () => {
    const error = new BusinessRuleError("regra violada");
    assert.equal(error.toJSON().code, "BUSINESS_RULE_ERROR");
  });
});
