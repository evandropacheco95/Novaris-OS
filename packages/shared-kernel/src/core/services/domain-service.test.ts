import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Result } from "../../types/result.js";
import { ValidationError } from "../../errors/validation-error.js";
import { InfrastructureError } from "../../errors/infrastructure-error.js";
import type { DomainService } from "./domain-service.js";
import type { AsyncDomainService } from "./async-domain-service.js";
import type { DomainServiceResult } from "./domain-service-result.js";

/** Fake síncrono — existe apenas para testar o contrato, não é entregável. */
class UppercaseDomainService implements DomainService<string, string> {
  execute(input: string): DomainServiceResult<string> {
    if (input.length === 0) {
      return Result.fail(new ValidationError("input não pode ser vazio"));
    }
    return Result.ok(input.toUpperCase());
  }
}

/** Fake assíncrono — existe apenas para testar o contrato, não é entregável. */
class AsyncUppercaseDomainService implements AsyncDomainService<string, string> {
  async execute(input: string): Promise<DomainServiceResult<string>> {
    if (input.length === 0) {
      return Result.fail(new InfrastructureError("falha simulada de infraestrutura"));
    }
    return Result.ok(input.toUpperCase());
  }
}

/** Fake genérico com TInput/TOutput diferentes — testa Generics com tipos distintos. */
class LengthDomainService implements DomainService<string, number> {
  execute(input: string): DomainServiceResult<number> {
    return Result.ok(input.length);
  }
}

describe("DomainService — tipagem e Generics", () => {
  it("aceita TInput e TOutput de tipos diferentes", () => {
    const service = new LengthDomainService();
    const result = service.execute("novaris");
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue(), 7);
  });
});

describe("DomainService — compatibilidade com Result", () => {
  it("execute síncrono devolve um Result de sucesso", () => {
    const service = new UppercaseDomainService();
    const result = service.execute("novaris");
    assert.equal(result instanceof Result, true);
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue(), "NOVARIS");
  });

  it("execute síncrono devolve um Result de falha sem lançar exceção", () => {
    const service = new UppercaseDomainService();
    assert.doesNotThrow(() => service.execute(""));
    const result = service.execute("");
    assert.equal(result.isFailure, true);
  });
});

describe("DomainService — compatibilidade com DomainError e InfrastructureError", () => {
  it("aceita DomainError (ex.: ValidationError) como erro", () => {
    const service = new UppercaseDomainService();
    const result = service.execute("");
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("aceita InfrastructureError como erro (via AsyncDomainService)", async () => {
    const service = new AsyncUppercaseDomainService();
    const result = await service.execute("");
    assert.equal(result.getError() instanceof InfrastructureError, true);
  });
});

describe("AsyncDomainService — herança de DomainService", () => {
  it("execute devolve Promise<DomainServiceResult<TOutput>>", async () => {
    const service = new AsyncUppercaseDomainService();
    const promise = service.execute("novaris");
    assert.equal(promise instanceof Promise, true);
    const result = await promise;
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue(), "NOVARIS");
  });

  it("uma instância de AsyncDomainService é atribuível a uma variável DomainService (herança real)", async () => {
    const asyncService: AsyncDomainService<string, string> = new AsyncUppercaseDomainService();
    const asBase: DomainService<string, string> = asyncService;

    const outcome = asBase.execute("novaris");
    assert.equal(outcome instanceof Promise, true);
    const result = await outcome;
    assert.equal(result.isSuccess, true);
  });

  it("uma implementação puramente síncrona também satisfaz DomainService", () => {
    const syncService: DomainService<string, string> = new UppercaseDomainService();
    const outcome = syncService.execute("novaris");
    assert.equal(outcome instanceof Promise, false);
    assert.equal((outcome as DomainServiceResult<string>).isSuccess, true);
  });
});
