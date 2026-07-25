import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { PipelineRepository } from "../../../domain/repositories/pipeline-repository.js";
import { Pipeline } from "../../../domain/aggregates/pipeline/pipeline.js";
import { InMemoryPipelineRepository } from "../../../infrastructure/repositories/in-memory-pipeline-repository.js";

/**
 * Suíte de testes do CONTRATO `PipelineRepository` — Ordem de Missão
 * ENG-0052. Mesma estratégia e mesma justificativa de desvio de precedente já
 * registradas em
 * [opportunity-repository.contract.test.ts](./opportunity-repository.contract.test.ts):
 * exercita `InMemoryPipelineRepository` (`ENG-0050`, implementação real, não
 * Fake) diretamente, em vez de checagem só de tipo (Organization) ou de uma
 * Fake local (Identity/Shared Kernel) — porque a infraestrutura real já
 * existe e a missão pede explicitamente para validá-la.
 *
 * Nenhuma regra de negócio nova, Entity, Aggregate, Value Object ou Domain
 * Event foi criado por esta suíte — `Pipeline`, `Stage` e `PipelineRepository`
 * (interface) permanecem inalterados.
 */

function buildPipeline(): Pipeline {
  return Pipeline.create({
    organizationId: new UniqueEntityId(),
  }).getValue()!;
}

describe("PipelineRepository — composição de ReadRepository<Pipeline> + WriteRepository<Pipeline>", () => {
  it("InMemoryPipelineRepository é atribuível a ReadRepository<Pipeline> e WriteRepository<Pipeline> isoladamente", () => {
    const repo: PipelineRepository = new InMemoryPipelineRepository();
    const asRead: ReadRepository<Pipeline> = repo;
    const asWrite: WriteRepository<Pipeline> = repo;
    assert.notEqual(asRead, undefined);
    assert.notEqual(asWrite, undefined);
  });
});

describe("PipelineRepository — save", () => {
  it("save persiste a Pipeline sem lançar exceção e devolve Result de sucesso", async () => {
    const repo = new InMemoryPipelineRepository();
    const pipeline = buildPipeline();

    const result = await repo.save(pipeline);
    assert.equal(result.isSuccess, true);
  });
});

describe("PipelineRepository — findById", () => {
  it("findById devolve Option.none quando a Pipeline não existe", async () => {
    const repo = new InMemoryPipelineRepository();

    const result = await repo.findById(new UniqueEntityId());
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()?.isNone, true);
  });

  it("findById devolve Option.some com a Pipeline correta após save", async () => {
    const repo = new InMemoryPipelineRepository();
    const pipeline = buildPipeline();
    await repo.save(pipeline);

    const result = await repo.findById(pipeline.id);
    const option = result.getValue();
    assert.equal(option?.isSome, true);
    const found = option?.getOrElse(null as never);
    assert.equal(found?.id.equals(pipeline.id), true);
    assert.equal(found?.organizationId.equals(pipeline.organizationId), true);
  });
});

describe("PipelineRepository — findAll", () => {
  it("findAll devolve todas as Pipelines salvas", async () => {
    const repo = new InMemoryPipelineRepository();
    await repo.save(buildPipeline());
    await repo.save(buildPipeline());

    const result = await repo.findAll();
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()?.length, 2);
  });
});

describe("PipelineRepository — exists", () => {
  it("exists reflete o estado de save/delete", async () => {
    const repo = new InMemoryPipelineRepository();
    const pipeline = buildPipeline();

    assert.equal((await repo.exists(pipeline.id)).getValue(), false);
    await repo.save(pipeline);
    assert.equal((await repo.exists(pipeline.id)).getValue(), true);
    await repo.delete(pipeline.id);
    assert.equal((await repo.exists(pipeline.id)).getValue(), false);
  });
});

describe("PipelineRepository — delete", () => {
  it("delete remove a Pipeline e devolve Result de sucesso", async () => {
    const repo = new InMemoryPipelineRepository();
    const pipeline = buildPipeline();
    await repo.save(pipeline);

    const result = await repo.delete(pipeline.id);
    assert.equal(result.isSuccess, true);
    assert.equal((await repo.exists(pipeline.id)).getValue(), false);
  });
});
