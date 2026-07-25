import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option, NotFoundError, ConflictError } from "@novaris/shared-kernel";
import type { InfrastructureError } from "@novaris/shared-kernel";
import { Opportunity } from "../../../../domain/aggregates/opportunity/opportunity.js";
import type { OpportunityRepository } from "../../../../domain/repositories/opportunity-repository.js";
import { MarkOpportunityWonHandler } from "../../../../application/handlers/mark-opportunity-won/mark-opportunity-won.handler.js";
import { MarkOpportunityWonCommand } from "../../../../application/commands/mark-opportunity-won/mark-opportunity-won.command.js";

/**
 * Testes unitários de `MarkOpportunityWonHandler` — Ordem de Missão ENG-0073.
 * Mesmo padrão de `FakeOpportunityRepository` local já registrado em
 * `create-opportunity.handler.test.ts`.
 */
class FakeOpportunityRepository implements OpportunityRepository {
  private readonly records = new Map<string, Opportunity>();
  saveCallCount = 0;
  findByIdCallCount = 0;

  async findById(id: UniqueEntityId): Promise<Result<Option<Opportunity>, InfrastructureError>> {
    this.findByIdCallCount++;
    const found = this.records.get(id.toValue());
    return Result.ok(found ? Option.some(found) : Option.none<Opportunity>());
  }

  async findAll(): Promise<Result<Opportunity[], InfrastructureError>> {
    return Result.ok(Array.from(this.records.values()));
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.records.has(id.toValue()));
  }

  async save(entity: Opportunity): Promise<Result<void, InfrastructureError>> {
    this.saveCallCount++;
    this.records.set(entity.id.toValue(), entity);
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.records.delete(id.toValue());
    return Result.ok(undefined);
  }

  seed(opportunity: Opportunity): void {
    this.records.set(opportunity.id.toValue(), opportunity);
  }
}

function buildOpportunity(): Opportunity {
  return Opportunity.create({
    organizationId: new UniqueEntityId(),
    partyId: new UniqueEntityId(),
  }).getValue()!;
}

describe("MarkOpportunityWonHandler — Dependency Injection", () => {
  it("usa exatamente a instância de OpportunityRepository injetada no construtor", async () => {
    const repository = new FakeOpportunityRepository();
    const opportunity = buildOpportunity();
    repository.seed(opportunity);
    const handler = new MarkOpportunityWonHandler(repository);

    await handler.execute(new MarkOpportunityWonCommand({ opportunityId: opportunity.id.toValue() }));

    assert.equal(repository.findByIdCallCount, 1);
    assert.equal(repository.saveCallCount, 1);
  });
});

describe("MarkOpportunityWonHandler — Command handling / Repository interaction", () => {
  it("localiza a Opportunity via findById usando o opportunityId do Command e marca como \"won\"", async () => {
    const repository = new FakeOpportunityRepository();
    const opportunity = buildOpportunity();
    repository.seed(opportunity);
    const handler = new MarkOpportunityWonHandler(repository);

    const result = await handler.execute(new MarkOpportunityWonCommand({ opportunityId: opportunity.id.toValue() }));

    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.status, "won");
  });

  it("retorna Result.fail(NotFoundError) quando a Opportunity não existe — erro existente do Shared Kernel, nenhum criado", async () => {
    const repository = new FakeOpportunityRepository();
    const handler = new MarkOpportunityWonHandler(repository);

    const result = await handler.execute(
      new MarkOpportunityWonCommand({ opportunityId: new UniqueEntityId().toValue() }),
    );

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof NotFoundError, true);
    assert.equal(repository.saveCallCount, 0);
  });
});

describe("MarkOpportunityWonHandler — Aggregate ownership / erro propagado", () => {
  it("Aggregate é dono da regra: Opportunity já fechada rejeita markWon() com ConflictError, propagado sem adaptação", async () => {
    const repository = new FakeOpportunityRepository();
    const opportunity = buildOpportunity();
    opportunity.markLost();
    repository.seed(opportunity);
    const handler = new MarkOpportunityWonHandler(repository);

    const result = await handler.execute(new MarkOpportunityWonCommand({ opportunityId: opportunity.id.toValue() }));

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ConflictError, true);
    assert.equal(repository.saveCallCount, 0, "save() não deve ser chamado quando o Aggregate rejeita a mutação");
  });
});
