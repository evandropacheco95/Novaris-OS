import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option, NotFoundError, ConflictError } from "@novaris/shared-kernel";
import type { InfrastructureError } from "@novaris/shared-kernel";
import { Opportunity } from "../../../../domain/aggregates/opportunity/opportunity.js";
import type { OpportunityRepository } from "../../../../domain/repositories/opportunity-repository.js";
import { ApproveProposalHandler } from "../../../../application/handlers/approve-proposal/approve-proposal.handler.js";
import { ApproveProposalCommand } from "../../../../application/commands/approve-proposal/approve-proposal.command.js";

/**
 * Testes unitários de `ApproveProposalHandler` — Ordem de Missão ENG-0073.
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

function buildOpportunityWithProposal(): { opportunity: Opportunity; proposalId: UniqueEntityId } {
  const opportunity = Opportunity.create({
    organizationId: new UniqueEntityId(),
    partyId: new UniqueEntityId(),
  }).getValue()!;
  const proposal = opportunity.submitProposal().getValue()!;
  return { opportunity, proposalId: proposal.id };
}

describe("ApproveProposalHandler — Dependency Injection", () => {
  it("usa exatamente a instância de OpportunityRepository injetada no construtor", async () => {
    const repository = new FakeOpportunityRepository();
    const { opportunity, proposalId } = buildOpportunityWithProposal();
    repository.seed(opportunity);
    const handler = new ApproveProposalHandler(repository);

    await handler.execute(
      new ApproveProposalCommand({ opportunityId: opportunity.id.toValue(), proposalId: proposalId.toValue() }),
    );

    assert.equal(repository.findByIdCallCount, 1);
    assert.equal(repository.saveCallCount, 1);
  });
});

describe("ApproveProposalHandler — Command handling / Repository interaction", () => {
  it("aprova a Proposal e devolve a mesma instância mutada pelo Aggregate", async () => {
    const repository = new FakeOpportunityRepository();
    const { opportunity, proposalId } = buildOpportunityWithProposal();
    repository.seed(opportunity);
    const handler = new ApproveProposalHandler(repository);

    const result = await handler.execute(
      new ApproveProposalCommand({ opportunityId: opportunity.id.toValue(), proposalId: proposalId.toValue() }),
    );

    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.status, "approved");
    assert.equal(result.getValue()!.id.equals(proposalId), true);
  });

  it("retorna Result.fail(NotFoundError) quando a Opportunity não existe — erro existente do Shared Kernel, nenhum criado", async () => {
    const repository = new FakeOpportunityRepository();
    const handler = new ApproveProposalHandler(repository);

    const result = await handler.execute(
      new ApproveProposalCommand({
        opportunityId: new UniqueEntityId().toValue(),
        proposalId: new UniqueEntityId().toValue(),
      }),
    );

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof NotFoundError, true);
    assert.equal(repository.saveCallCount, 0);
  });
});

describe("ApproveProposalHandler — Aggregate ownership / erro propagado", () => {
  it("Aggregate é dono da regra: proposalId inexistente na Opportunity rejeita com NotFoundError interno, propagado sem adaptação", async () => {
    const repository = new FakeOpportunityRepository();
    const opportunity = Opportunity.create({
      organizationId: new UniqueEntityId(),
      partyId: new UniqueEntityId(),
    }).getValue()!;
    repository.seed(opportunity);
    const handler = new ApproveProposalHandler(repository);

    const result = await handler.execute(
      new ApproveProposalCommand({
        opportunityId: opportunity.id.toValue(),
        proposalId: new UniqueEntityId().toValue(),
      }),
    );

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof NotFoundError, true);
    assert.equal(repository.saveCallCount, 0);
  });

  it("Aggregate é dono da regra: aprovar uma Proposal já aprovada rejeita com ConflictError, propagado sem adaptação", async () => {
    const repository = new FakeOpportunityRepository();
    const { opportunity, proposalId } = buildOpportunityWithProposal();
    opportunity.approveProposal(proposalId);
    repository.seed(opportunity);
    const handler = new ApproveProposalHandler(repository);

    const result = await handler.execute(
      new ApproveProposalCommand({ opportunityId: opportunity.id.toValue(), proposalId: proposalId.toValue() }),
    );

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ConflictError, true);
    assert.equal(repository.saveCallCount, 0);
  });
});
