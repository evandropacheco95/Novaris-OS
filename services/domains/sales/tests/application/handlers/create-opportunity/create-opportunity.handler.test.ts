import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option } from "@novaris/shared-kernel";
import type { InfrastructureError } from "@novaris/shared-kernel";
import { Opportunity } from "../../../../domain/aggregates/opportunity/opportunity.js";
import type { OpportunityRepository } from "../../../../domain/repositories/opportunity-repository.js";
import { CreateOpportunityHandler } from "../../../../application/handlers/create-opportunity/create-opportunity.handler.js";
import { CreateOpportunityCommand } from "../../../../application/commands/create-opportunity/create-opportunity.command.js";

/**
 * Testes unitários de `CreateOpportunityHandler` — Ordem de Missão ENG-0073.
 *
 * `FakeOpportunityRepository` — Fake em memória, definido só neste arquivo,
 * não é entregável de produção (mesmo padrão de fixture já usado em
 * `packages/shared-kernel/src/core/repositories/repository.test.ts` e
 * `services/kernel/identity/tests/domain/repositories/user-repository.test.ts`).
 * Diferente da suíte de contrato de Repository (`ENG-0052`, que exercita a
 * `InMemoryOpportunityRepository` real), esta suíte testa a **orquestração
 * do Handler**, isolada de qualquer implementação real de Infrastructure —
 * por isso um Fake local, não a implementação de produção. Armazena a
 * própria instância de `Opportunity` diretamente (sem Mapper/Record), e
 * conta chamadas (`saveCallCount`/`findByIdCallCount`) para permitir
 * verificar "Repository é chamado corretamente".
 */
class FakeOpportunityRepository implements OpportunityRepository {
  private readonly records = new Map<string, Opportunity>();
  saveCallCount = 0;
  findByIdCallCount = 0;
  lastSaved: Opportunity | undefined;

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
    this.lastSaved = entity;
    this.records.set(entity.id.toValue(), entity);
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.records.delete(id.toValue());
    return Result.ok(undefined);
  }
}

function buildCommand(overrides: Partial<{ organizationId: string; partyId: string; pipelineId?: string; currentStageId?: string }> = {}) {
  return new CreateOpportunityCommand({
    organizationId: overrides.organizationId ?? new UniqueEntityId().toValue(),
    partyId: overrides.partyId ?? new UniqueEntityId().toValue(),
    pipelineId: overrides.pipelineId,
    currentStageId: overrides.currentStageId,
  });
}

describe("CreateOpportunityHandler — Dependency Injection", () => {
  it("usa exatamente a instância de OpportunityRepository injetada no construtor", async () => {
    const repository = new FakeOpportunityRepository();
    const handler = new CreateOpportunityHandler(repository);

    await handler.execute(buildCommand());

    assert.equal(repository.saveCallCount, 1);
  });

  it("duas instâncias de Handler com repositórios distintos não compartilham estado", async () => {
    const repositoryA = new FakeOpportunityRepository();
    const repositoryB = new FakeOpportunityRepository();
    const handlerA = new CreateOpportunityHandler(repositoryA);
    const handlerB = new CreateOpportunityHandler(repositoryB);

    await handlerA.execute(buildCommand());

    assert.equal(repositoryA.saveCallCount, 1);
    assert.equal(repositoryB.saveCallCount, 0);

    await handlerB.execute(buildCommand());
    await handlerB.execute(buildCommand());

    assert.equal(repositoryA.saveCallCount, 1, "repositoryA não deve ser afetado por chamadas em handlerB");
    assert.equal(repositoryB.saveCallCount, 2);
  });
});

describe("CreateOpportunityHandler — Command handling", () => {
  it("converte organizationId/partyId do Command para UniqueEntityId no Aggregate criado", async () => {
    const organizationId = new UniqueEntityId().toValue();
    const partyId = new UniqueEntityId().toValue();
    const repository = new FakeOpportunityRepository();
    const handler = new CreateOpportunityHandler(repository);

    const result = await handler.execute(buildCommand({ organizationId, partyId }));

    assert.equal(result.isSuccess, true);
    const opportunity = result.getValue()!;
    assert.equal(opportunity.organizationId.toValue(), organizationId);
    assert.equal(opportunity.partyId.toValue(), partyId);
  });

  it("converte pipelineId/currentStageId apenas quando presentes no Command", async () => {
    const repository = new FakeOpportunityRepository();
    const handler = new CreateOpportunityHandler(repository);

    const withoutOptionals = await handler.execute(buildCommand());
    assert.equal(withoutOptionals.getValue()!.pipelineId, undefined);
    assert.equal(withoutOptionals.getValue()!.currentStageId, undefined);

    const pipelineId = new UniqueEntityId().toValue();
    const currentStageId = new UniqueEntityId().toValue();
    const withOptionals = await handler.execute(buildCommand({ pipelineId, currentStageId }));
    assert.equal(withOptionals.getValue()!.pipelineId?.toValue(), pipelineId);
    assert.equal(withOptionals.getValue()!.currentStageId?.toValue(), currentStageId);
  });
});

describe("CreateOpportunityHandler — Repository interaction", () => {
  it("persiste a Opportunity criada via save(), nunca via findById/exists", async () => {
    const repository = new FakeOpportunityRepository();
    const handler = new CreateOpportunityHandler(repository);

    const result = await handler.execute(buildCommand());

    assert.equal(repository.saveCallCount, 1);
    assert.equal(repository.findByIdCallCount, 0);
    assert.equal(repository.lastSaved?.id.equals(result.getValue()!.id), true);
  });
});

describe("CreateOpportunityHandler — Aggregate ownership / Result propagation", () => {
  it("retorna Result.ok com a Opportunity no status \"open\" — regra pertence a Opportunity.create()", async () => {
    const repository = new FakeOpportunityRepository();
    const handler = new CreateOpportunityHandler(repository);

    const result = await handler.execute(buildCommand());

    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.status, "open");
  });

  it("achado: Opportunity.create() nunca falha hoje (organizationId/partyId não têm validação de formato) — nenhum cenário de falha existe para este Handler, não inventado aqui", async () => {
    const repository = new FakeOpportunityRepository();
    const handler = new CreateOpportunityHandler(repository);

    const result = await handler.execute(buildCommand());
    assert.equal(result.isFailure, false);
  });
});
