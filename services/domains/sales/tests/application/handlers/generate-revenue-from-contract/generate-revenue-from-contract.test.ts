import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Option, Result, type InfrastructureError } from "@novaris/shared-kernel";
import { Contract } from "../../../../domain/aggregates/contract/contract.js";
import type { Revenue } from "../../../../domain/aggregates/revenue/revenue.js";
import type { ContractRepository } from "../../../../domain/repositories/contract-repository.js";
import type { RevenueRepository } from "../../../../domain/repositories/revenue-repository.js";
import { GenerateRevenueFromContractHandler } from "../../../../application/handlers/generate-revenue-from-contract/generate-revenue-from-contract.handler.js";
import { GenerateRevenueFromContractCommand } from "../../../../application/commands/generate-revenue-from-contract/generate-revenue-from-contract.command.js";

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

class FakeRevenueRepository implements RevenueRepository {
  private readonly revenues = new Map<string, Revenue>();
  async findById(id: UniqueEntityId): Promise<Result<Option<Revenue>, InfrastructureError>> {
    const found = this.revenues.get(id.toString());
    return Result.ok(found ? Option.some(found) : Option.none<Revenue>());
  }
  async findAll(): Promise<Result<Revenue[], InfrastructureError>> {
    return Result.ok([...this.revenues.values()]);
  }
  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.revenues.has(id.toString()));
  }
  async save(entity: Revenue): Promise<Result<void, InfrastructureError>> {
    this.revenues.set(entity.id.toString(), entity);
    return Result.ok(undefined);
  }
  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.revenues.delete(id.toString());
    return Result.ok(undefined);
  }
}

describe("GenerateRevenueFromContractHandler", () => {
  it("gera um Revenue real a partir de um Contract active", async () => {
    const contractRepository = new FakeContractRepository();
    const revenueRepository = new FakeRevenueRepository();
    const handler = new GenerateRevenueFromContractHandler(revenueRepository, contractRepository);

    const contract = Contract.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), quotationId: new UniqueEntityId() }).getValue()!;
    contract.activate();
    contractRepository.add(contract);

    const result = await handler.execute(new GenerateRevenueFromContractCommand({ contractId: contract.id.toString(), amount: 500, currency: "BRL" }));
    assert.equal(result.isSuccess, true);
    const revenue = result.getValue()!;
    assert.equal(revenue.amount, 500);
    assert.equal(revenue.contractId.equals(contract.id), true);
    assert.equal(revenue.organizationId.equals(contract.organizationId), true);
  });

  it("permite gerar múltiplos Revenue para o mesmo Contract (reconhecimento incremental)", async () => {
    const contractRepository = new FakeContractRepository();
    const revenueRepository = new FakeRevenueRepository();
    const handler = new GenerateRevenueFromContractHandler(revenueRepository, contractRepository);

    const contract = Contract.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), quotationId: new UniqueEntityId() }).getValue()!;
    contract.activate();
    contractRepository.add(contract);

    const first = await handler.execute(new GenerateRevenueFromContractCommand({ contractId: contract.id.toString(), amount: 500, currency: "BRL" }));
    const second = await handler.execute(new GenerateRevenueFromContractCommand({ contractId: contract.id.toString(), amount: 300, currency: "BRL" }));
    assert.equal(first.isSuccess, true);
    assert.equal(second.isSuccess, true);

    const all = await revenueRepository.findAll();
    assert.equal(all.getValue()!.length, 2);
  });

  it("rejeita gerar Revenue de um Contract ainda 'draft'", async () => {
    const contractRepository = new FakeContractRepository();
    const revenueRepository = new FakeRevenueRepository();
    const handler = new GenerateRevenueFromContractHandler(revenueRepository, contractRepository);

    const contract = Contract.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), quotationId: new UniqueEntityId() }).getValue()!;
    contractRepository.add(contract);

    const result = await handler.execute(new GenerateRevenueFromContractCommand({ contractId: contract.id.toString(), amount: 500, currency: "BRL" }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });

  it("rejeita gerar Revenue de um Contract já 'terminated'", async () => {
    const contractRepository = new FakeContractRepository();
    const revenueRepository = new FakeRevenueRepository();
    const handler = new GenerateRevenueFromContractHandler(revenueRepository, contractRepository);

    const contract = Contract.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId(), quotationId: new UniqueEntityId() }).getValue()!;
    contract.activate();
    contract.terminate();
    contractRepository.add(contract);

    const result = await handler.execute(new GenerateRevenueFromContractCommand({ contractId: contract.id.toString(), amount: 500, currency: "BRL" }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });

  it("devolve NotFoundError para contractId inexistente", async () => {
    const contractRepository = new FakeContractRepository();
    const revenueRepository = new FakeRevenueRepository();
    const handler = new GenerateRevenueFromContractHandler(revenueRepository, contractRepository);

    const result = await handler.execute(new GenerateRevenueFromContractCommand({ contractId: new UniqueEntityId().toString(), amount: 500, currency: "BRL" }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "NOT_FOUND_ERROR");
  });
});
