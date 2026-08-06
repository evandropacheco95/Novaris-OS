import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateReadOnlySql } from "../../../src/domain/services/sql-guard.js";

describe("validateReadOnlySql", () => {
  it("aceita um SELECT simples sobre tabela na allowlist", () => {
    const result = validateReadOnlySql('SELECT * FROM "opportunities" WHERE status = \'open\'');
    assert.equal(result.isSuccess, true);
  });

  it("aceita SELECT com JOIN entre tabelas na allowlist", () => {
    const result = validateReadOnlySql("SELECT o.id FROM opportunities o JOIN parties p ON p.id = o.party_id");
    assert.equal(result.isSuccess, true);
  });

  it("é case-insensitive quanto a SELECT", () => {
    const result = validateReadOnlySql("select * from leads");
    assert.equal(result.isSuccess, true);
  });

  it("rejeita SQL vazio", () => {
    const result = validateReadOnlySql("   ");
    assert.equal(result.isFailure, true);
  });

  it("rejeita statement que não começa com SELECT", () => {
    const result = validateReadOnlySql("DELETE FROM opportunities");
    assert.equal(result.isFailure, true);
  });

  for (const keyword of ["INSERT INTO leads (name) VALUES ('x')", "UPDATE leads SET name = 'x'", "DROP TABLE leads", "TRUNCATE leads", "ALTER TABLE leads ADD COLUMN x TEXT", "GRANT ALL ON leads TO public"]) {
    it(`rejeita statement contendo palavra-chave de escrita: "${keyword.split(" ")[0]}"`, () => {
      const result = validateReadOnlySql(keyword);
      assert.equal(result.isFailure, true);
    });
  }

  it("rejeita múltiplos statements encadeados por ';'", () => {
    const result = validateReadOnlySql("SELECT * FROM leads; DROP TABLE leads;");
    assert.equal(result.isFailure, true);
  });

  it("rejeita comentários SQL de linha ('--')", () => {
    const result = validateReadOnlySql("SELECT * FROM leads -- ; DROP TABLE leads");
    assert.equal(result.isFailure, true);
  });

  it("rejeita comentários SQL de bloco ('/* */')", () => {
    const result = validateReadOnlySql("SELECT * FROM leads /* comentário */");
    assert.equal(result.isFailure, true);
  });

  it("rejeita tabela fora da allowlist (ex.: credentials)", () => {
    const result = validateReadOnlySql("SELECT * FROM credentials");
    assert.equal(result.isFailure, true);
  });

  it("rejeita tabela do Financial Domain (invoices), mesmo critério de bloqueio da Winnet a financeiro_*", () => {
    const result = validateReadOnlySql("SELECT * FROM invoices");
    assert.equal(result.isFailure, true);
  });

  it("rejeita tabela de Identity (users)", () => {
    const result = validateReadOnlySql("SELECT * FROM users");
    assert.equal(result.isFailure, true);
  });

  it("permite SELECT sem cláusula FROM (ex.: SELECT 1)", () => {
    const result = validateReadOnlySql("SELECT 1");
    assert.equal(result.isSuccess, true);
  });
});
