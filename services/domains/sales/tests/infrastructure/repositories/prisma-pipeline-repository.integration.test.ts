import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Pipeline } from "../../../domain/aggregates/pipeline/pipeline.js";
import { Stage } from "../../../domain/entities/stage/stage.js";
import { PrismaPipelineRepository } from "../../../infrastructure/repositories/prisma-pipeline-repository.js";

/**
 * Teste de integração real — mesma disciplina de
 * `prisma-opportunity-repository.integration.test.ts`, contra o Postgres real
 * (Supabase). Limpa (soft delete) todo dado criado.
 */
describe("PrismaPipelineRepository — integração real (Supabase)", () => {
  const repository = new PrismaPipelineRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.stage.deleteMany({ where: { pipelineId: { in: createdIds } } });
    await prisma.pipeline.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera uma Pipeline real do Postgres", async () => {
    const organizationId = new UniqueEntityId();
    const pipeline = Pipeline.create({ organizationId, name: "Pipeline Padrão" }).getValue()!;
    createdIds.push(pipeline.id.toString());

    const saveResult = await repository.save(pipeline);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const findResult = await repository.findById(pipeline.id);
    const option = findResult.getValue()!;
    assert.equal(option.isSome, true);

    const fetched = option.getOrElse(null as never);
    assert.equal(fetched.id.toString(), pipeline.id.toString());
    assert.equal(fetched.organizationId.toString(), organizationId.toString());
  });

  it("persiste Stage como Internal Entity, via a coleção da Pipeline", async () => {
    const pipeline = Pipeline.create({ organizationId: new UniqueEntityId(), name: "Pipeline Padrão" }).getValue()!;
    createdIds.push(pipeline.id.toString());

    const stage = Stage.create({ name: "Qualificação", order: 0 }).getValue()!;
    const addResult = pipeline.addStage(stage);
    assert.equal(addResult.isSuccess, true);

    await repository.save(pipeline);

    const fetched = (await repository.findById(pipeline.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.getStages().length, 1);
    assert.equal(fetched.getStages()[0]!.name, "Qualificação");
  });

  it("exists() e delete() (soft delete) funcionam contra o banco real", async () => {
    const pipeline = Pipeline.create({ organizationId: new UniqueEntityId(), name: "Pipeline Padrão" }).getValue()!;
    createdIds.push(pipeline.id.toString());
    await repository.save(pipeline);

    const existsBefore = await repository.exists(pipeline.id);
    assert.equal(existsBefore.getValue(), true);

    await repository.delete(pipeline.id);

    const existsAfter = await repository.exists(pipeline.id);
    assert.equal(existsAfter.getValue(), false);
  });
});
