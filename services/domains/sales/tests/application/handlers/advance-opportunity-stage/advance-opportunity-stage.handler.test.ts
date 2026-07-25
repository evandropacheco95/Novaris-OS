import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option, NotFoundError, ConflictError } from "@novaris/shared-kernel";
import type { InfrastructureError } from "@novaris/shared-kernel";
import { Opportunity } from "../../../../domain/aggregates/opportunity/opportunity.js";
import type { OpportunityRepository } from "../../../../domain/repositories/opportunity-repository.js";
import { AdvanceOpportunityStageHandler } from "../../../../application/handlers/advance-opportunity-stage/advance-opportunity-stage.handler.js";
import { AdvanceOpportunityStageCommand } from "../../../../application/commands/advance-opportunity-stage/advance-opportunity-stage.command.js";

/**
 * Testes unitários de `AdvanceOpportunityStageHandler` — Ordem de Missão
 * ENG-0073. Mesmo padrão de `FakeOpportunityRepository` local já registrado
 * em `create-opportunity.handler.test.ts` — Fake em memória, não entregável
 * de produção, isola a orquestração do Handler de qualquer Infrastructure real.
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

describe("AdvanceOpportunityStageHandler — Dependency Injection", () => {
  it("usa exatamente a instância de OpportunityRepository injetada no construtor", async () => {
    const repository = new FakeOpportunityRepository();
    const opportunity = buildOpportunity();
    repository.seed(opportunity);
    const handler = new AdvanceOpportunityStageHandler(repository);

    await handler.execute(
      new AdvanceOpportunityStageCommand({
        opportunityId: opportunity.id.toValue(),
        stageId: new UniqueEntityId().toValue(),
      }),
    );

    assert.equal(repository.findByIdCallCount, 1);
    assert.equal(repository.saveCallCount, 1);
  });
});

describe("AdvanceOpportunityStageHandler — Command handling / Repository interaction", () => {
  it("localiza a Opportunity via findById usando o opportunityId do Command", async () => {
    const repository = new FakeOpportunityRepository();
    const opportunity = buildOpportunity();
    repository.seed(opportunity);
    const handler = new AdvanceOpportunityStageHandler(repository);
    const stageId = new UniqueEntityId().toValue();

    const result = await handler.execute(
      new AdvanceOpportunityStageCommand({ opportunityId: opportunity.id.toValue(), stageId }),
    );

    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.currentStageId?.toValue(), stageId);
  });

  it("retorna Result.fail(NotFoundError) quando a Opportunity não existe — erro existente do Shared Kernel, nenhum criado", async () => {
    const repository = new FakeOpportunityRepository();
    const handler = new AdvanceOpportunityStageHandler(repository);

    const result = await handler.execute(
      new AdvanceOpportunityStageCommand({
        opportunityId: new UniqueEntityId().toValue(),
        stageId: new UniqueEntityId().toValue(),
      }),
    );

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof NotFoundError, true);
    assert.equal(repository.saveCallCount, 0);
  });
});

describe("AdvanceOpportunityStageHandler — Aggregate ownership / erro propagado", () => {
  it("Aggregate é dono da regra: Opportunity fechada rejeita advanceStage() com ConflictError, propagado sem adaptação", async () => {
    const repository = new FakeOpportunityRepository();
    const opportunity = buildOpportunity();
    opportunity.markWon();
    repository.seed(opportunity);
    const handler = new AdvanceOpportunityStageHandler(repository);

    const result = await handler.execute(
      new AdvanceOpportunityStageCommand({
        opportunityId: opportunity.id.toValue(),
        stageId: new UniqueEntityId().toValue(),
      }),
    );

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ConflictError, true);
    assert.equal(repository.saveCallCount, 0, "save() não deve ser chamado quando o Aggregate rejeita a mutação");
  });
});
