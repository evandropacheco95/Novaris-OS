import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Option, Result, type InfrastructureError } from "@novaris/shared-kernel";
import { Contract } from "../../../../domain/aggregates/contract/contract.js";
import type { ContractRepository } from "../../../../domain/repositories/contract-repository.js";
import { UpdateFiscalDocumentHandler } from "../../../../application/handlers/update-fiscal-document/update-fiscal-document.handler.js";
import { UpdateFiscalDocumentCommand } from "../../../../application/commands/update-fiscal-document/update-fiscal-document.command.js";

class FakeContractRepository implements ContractRepository {
  constructor(private readonly contracts: Map<string, Contract> = new Map()) {}
  add(contract: Contract): void {
    this.contracts.set(contract.id.toString(), contract);
  }
  async findById(id: UniqueEntityId): Promise<Result<Option<Contract>, InfrastructureError>> {
    const found = this.contracts.get(id.toString());
    return Result.ok(found ? Option.some(found) : Option.none<Contract>());
  }
  async findAll(): Promise<Result<Contract[], InfrastructureError>> {
    return Result.ok([...this.contracts.values()]);
  }
  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.contracts.has(id.toString()));
  }
  async save(entity: Contract): Promise<Result<void, InfrastructureError>> {
    this.contracts.set(entity.id.toString(), entity);
    return Result.ok(undefined);
  }
  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.contracts.delete(id.toString());
    return Result.ok(undefined);
  }
}

function createContract(): Contract {
  return Contract.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), quotationId: new UniqueEntityId() }).getValue()!;
}

describe("UpdateFiscalDocumentHandler", () => {
  it("atribui o Documento Fiscal e persiste", async () => {
    const repository = new FakeContractRepository();
    const handler = new UpdateFiscalDocumentHandler(repository);
    const contract = createContract();
    repository.add(contract);

    const result = await handler.execute(
      new UpdateFiscalDocumentCommand({ contractId: contract.id.toString(), fiscalDocumentNumber: "123456", fiscalDocumentAccessKey: "1".repeat(44) }),
    );
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.fiscalDocumentNumber, "123456");
  });

  it("devolve ValidationError para chave de acesso com formato inválido, sem chamar save()", async () => {
    const repository = new FakeContractRepository();
    const handler = new UpdateFiscalDocumentHandler(repository);
    const contract = createContract();
    repository.add(contract);

    const result = await handler.execute(new UpdateFiscalDocumentCommand({ contractId: contract.id.toString(), fiscalDocumentAccessKey: "123" }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("devolve NotFoundError para contractId inexistente", async () => {
    const repository = new FakeContractRepository();
    const handler = new UpdateFiscalDocumentHandler(repository);

    const result = await handler.execute(new UpdateFiscalDocumentCommand({ contractId: new UniqueEntityId().toString(), fiscalDocumentNumber: "1" }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "NOT_FOUND_ERROR");
  });
});
