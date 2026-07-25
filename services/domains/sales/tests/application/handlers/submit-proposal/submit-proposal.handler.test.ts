import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option, NotFoundError } from "@novaris/shared-kernel";
import type { InfrastructureError } from "@novaris/shared-kernel";
import { Opportunity } from "../../../../domain/aggregates/opportunity/opportunity.js";
import type { OpportunityRepository } from "../../../../domain/repositories/opportunity-repository.js";
import { SubmitProposalHandler } from "../../../../application/handlers/submit-proposal/submit-proposal.handler.js";
import { SubmitProposalCommand } from "../../../../application/commands/submit-proposal/submit-proposal.command.js";

/**
 * Testes unitários de `SubmitProposalHandler` — Ordem de Missão ENG-0073.
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

describe("SubmitProposalHandler — Dependency Injection", () => {
  it("usa exatamente a instância de OpportunityRepository injetada no construtor", async () => {
    const repository = new FakeOpportunityRepository();
    const opportunity = buildOpportunity();
    repository.seed(opportunity);
    const handler = new SubmitProposalHandler(repository);

    await handler.execute(new SubmitProposalCommand({ opportunityId: opportunity.id.toValue() }));

    assert.equal(repository.findByIdCallCount, 1);
    assert.equal(repository.saveCallCount, 1);
  });
});

describe("SubmitProposalHandler — Command handling / Repository interaction", () => {
  it("localiza a Opportunity via findById usando o opportunityId do Command e devolve a Proposal criada", async () => {
    const repository = new FakeOpportunityRepository();
    const opportunity = buildOpportunity();
    repository.seed(opportunity);
    const handler = new SubmitProposalHandler(repository);

    const result = await handler.execute(new SubmitProposalCommand({ opportunityId: opportunity.id.toValue() }));

    assert.equal(result.isSuccess, true);
    const proposal = result.getValue()!;
    assert.equal(proposal.status, "pending");
    assert.equal(opportunity.findProposal(proposal.id)?.id.equals(proposal.id), true);
  });

  it("retorna Result.fail(NotFoundError) quando a Opportunity não existe — erro existente do Shared Kernel, nenhum criado", async () => {
    const repository = new FakeOpportunityRepository();
    const handler = new SubmitProposalHandler(repository);

    const result = await handler.execute(
      new SubmitProposalCommand({ opportunityId: new UniqueEntityId().toValue() }),
    );

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof NotFoundError, true);
    assert.equal(repository.saveCallCount, 0);
  });
});

describe("SubmitProposalHandler — Aggregate ownership", () => {
  it("achado: Opportunity.submitProposal() nunca falha hoje (CreateProposalInput vazio, id sempre novo) — nenhum cenário de falha existe para este Handler, não inventado aqui", async () => {
    const repository = new FakeOpportunityRepository();
    const opportunity = buildOpportunity();
    repository.seed(opportunity);
    const handler = new SubmitProposalHandler(repository);

    const first = await handler.execute(new SubmitProposalCommand({ opportunityId: opportunity.id.toValue() }));
    const second = await handler.execute(new SubmitProposalCommand({ opportunityId: opportunity.id.toValue() }));

    assert.equal(first.isFailure, false);
    assert.equal(second.isFailure, false);
    assert.equal(opportunity.getProposals().length, 2);
  });
});
