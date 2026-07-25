import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ValidationError } from "@novaris/shared-kernel";
import { Permission } from "../../../src/domain/value-objects/permission.js";

describe("Permission", () => {
  it("cria uma Permission válida no formato <domínio>.<recurso>.<ação>", () => {
    const result = Permission.create("crm.leads.read");
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()?.code, "crm.leads.read");
  });

  it("aceita os exemplos já oficiais do BOM.md", () => {
    assert.equal(Permission.create("financial.invoice.delete").isSuccess, true);
  });

  it("rejeita um código sem os 3 segmentos", () => {
    const result = Permission.create("crm.leads");
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("rejeita um código vazio", () => {
    const result = Permission.create("");
    assert.equal(result.isFailure, true);
  });

  it("rejeita segmentos com maiúsculas", () => {
    const result = Permission.create("CRM.Leads.Read");
    assert.equal(result.isFailure, true);
  });

  it("é imutável — instâncias com o mesmo código são iguais por valor", () => {
    const a = Permission.create("crm.leads.read").getValue();
    const b = Permission.create("crm.leads.read").getValue();
    assert.equal(a?.equals(b), true);
  });

  it("instâncias com códigos diferentes não são iguais", () => {
    const a = Permission.create("crm.leads.read").getValue();
    const b = Permission.create("crm.leads.write").getValue();
    assert.equal(a?.equals(b), false);
  });

  it("nunca lança exceção — retorna Result mesmo para entrada inválida", () => {
    assert.doesNotThrow(() => Permission.create("inválido"));
  });
});
