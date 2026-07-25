import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Project } from "../../../domain/aggregates/project/project.js";
import { PrismaProjectRepository } from "../../../infrastructure/repositories/prisma-project-repository.js";

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), via
 * `@novaris/database`. Prova que `PrismaProjectRepository` funciona contra um
 * banco de dados real, incluindo a sincronização transacional da coleção de
 * `Task`s (mesmo princípio de `Proposal`/`Opportunity`, Sales) e o soft delete.
 */
describe("PrismaProjectRepository — integração real (Supabase)", () => {
  const repository = new PrismaProjectRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.task.deleteMany({ where: { projectId: { in: createdIds } } });
    await prisma.project.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera um Project real do Postgres, sem Tasks", async () => {
    const project = Project.create({ organizationId: new UniqueEntityId(), name: "Projeto Integração" }).getValue()!;
    createdIds.push(project.id.toString());

    const saveResult = await repository.save(project);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const fetched = (await repository.findById(project.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.name, "Projeto Integração");
    assert.equal(fetched.getTasks().length, 0);
  });

  it("persiste a coleção de Tasks via transação, e re-save não duplica", async () => {
    const project = Project.create({ organizationId: new UniqueEntityId(), name: "Com Tasks" }).getValue()!;
    createdIds.push(project.id.toString());
    const task1 = project.addTask({ title: "Primeira Task" }).getValue()!;
    project.addTask({ title: "Segunda Task" });
    await repository.save(project);

    const fetched = (await repository.findById(project.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.getTasks().length, 2);

    // Muda o status de uma Task e re-salva — prova que o upsert atualiza, não duplica.
    const fetchedTask = fetched.findTask(task1.id)!;
    fetchedTask.updateStatus("in_progress");
    await repository.save(fetched);

    const refetched = (await repository.findById(project.id)).getValue()!.getOrElse(null as never);
    assert.equal(refetched.getTasks().length, 2, "re-save não deveria duplicar Tasks");
    assert.equal(refetched.findTask(task1.id)!.status, "in_progress");
  });

  it("delete() é soft — exists()/findById() respeitam deletedAt IS NULL", async () => {
    const project = Project.create({ organizationId: new UniqueEntityId(), name: "Temporário" }).getValue()!;
    createdIds.push(project.id.toString());
    await repository.save(project);

    assert.equal((await repository.exists(project.id)).getValue(), true);
    await repository.delete(project.id);
    assert.equal((await repository.exists(project.id)).getValue(), false);

    const afterDelete = (await repository.findById(project.id)).getValue()!;
    assert.equal(afterDelete.isNone, true);
  });
});
