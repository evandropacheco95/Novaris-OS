import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Option, Result, type InfrastructureError } from "@novaris/shared-kernel";
import { Quotation } from "../../../../domain/aggregates/quotation/quotation.js";
import type { Contract } from "../../../../domain/aggregates/contract/contract.js";
import type { ContractRepository } from "../../../../domain/repositories/contract-repository.js";
import type { QuotationRepository } from "../../../../domain/repositories/quotation-repository.js";
import { GenerateContractFromQuotationHandler } from "../../../../application/handlers/generate-contract-from-quotation/generate-contract-from-quotation.handler.js";
import { GenerateContractFromQuotationCommand } from "../../../../application/commands/generate-contract-from-quotation/generate-contract-from-quotation.command.js";

class FakeQuotationRepository implements QuotationRepository {
  constructor(private readonly quotations: Map<string, Quotation> = new Map()) {}
  add(quotation: Quotation): void {
    this.quotations.set(quotation.id.toString(), quotation);
  }
  async findById(id: UniqueEntityId): Promise<Result<Option<Quotation>, InfrastructureError>> {
    const found = this.quotations.get(id.toString());
    return Result.ok(found ? Option.some(found) : Option.none<Quotation>());
  }
  async findAll(): Promise<Result<Quotation[], InfrastructureError>> {
    return Result.ok([...this.quotations.values()]);
  }
  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.quotations.has(id.toString()));
  }
  async save(entity: Quotation): Promise<Result<void, InfrastructureError>> {
    this.quotations.set(entity.id.toString(), entity);
    return Result.ok(undefined);
  }
  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.quotations.delete(id.toString());
    return Result.ok(undefined);
  }
}

class FakeContractRepository implements ContractRepository {
  private readonly contracts = new Map<string, Contract>();
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

describe("GenerateContractFromQuotationHandler", () => {
  it("gera um Contract real a partir de uma Quotation accepted", async () => {
    const quotationRepository = new FakeQuotationRepository();
    const contractRepository = new FakeContractRepository();
    const handler = new GenerateContractFromQuotationHandler(contractRepository, quotationRepository);

    const quotation = Quotation.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId() }).getValue()!;
    quotation.send();
    quotation.accept();
    quotationRepository.add(quotation);

    const result = await handler.execute(new GenerateContractFromQuotationCommand({ quotationId: quotation.id.toString() }));
    assert.equal(result.isSuccess, true);
    const contract = result.getValue()!;
    assert.equal(contract.status, "draft");
    assert.equal(contract.opportunityId.equals(quotation.opportunityId), true);
    assert.equal(contract.quotationId.equals(quotation.id), true);
  });

  it("rejeita gerar Contract de uma Quotation ainda 'draft'", async () => {
    const quotationRepository = new FakeQuotationRepository();
    const contractRepository = new FakeContractRepository();
    const handler = new GenerateContractFromQuotationHandler(contractRepository, quotationRepository);

    const quotation = Quotation.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId() }).getValue()!;
    quotationRepository.add(quotation);

    const result = await handler.execute(new GenerateContractFromQuotationCommand({ quotationId: quotation.id.toString() }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });

  it("devolve NotFoundError para quotationId inexistente", async () => {
    const quotationRepository = new FakeQuotationRepository();
    const contractRepository = new FakeContractRepository();
    const handler = new GenerateContractFromQuotationHandler(contractRepository, quotationRepository);

    const result = await handler.execute(new GenerateContractFromQuotationCommand({ quotationId: new UniqueEntityId().toString() }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "NOT_FOUND_ERROR");
  });
});
