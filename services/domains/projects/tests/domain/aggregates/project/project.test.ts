import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Project } from "../../../../domain/aggregates/project/project.js";

function buildCreateInput(overrides: Partial<Parameters<typeof Project.create>[0]> = {}) {
  return {
    organizationId: new UniqueEntityId(),
    name: "Implantação NOVARIS",
    ...overrides,
  };
}

describe("Project.create", () => {
  it("cria um Project válido, sem Tasks", () => {
    const input = buildCreateInput();
    const result = Project.create(input);
    assert.equal(result.isSuccess, true);

    const project = result.getValue()!;
    assert.equal(project.organizationId.equals(input.organizationId), true);
    assert.equal(project.name, "Implantação NOVARIS");
    assert.equal(project.getTasks().length, 0);
  });

  it("rejeita name vazio", () => {
    const result = Project.create(buildCreateInput({ name: "" }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("não dispara nenhum Domain Event (ProjectCreated não confirmado)", () => {
    const project = Project.create(buildCreateInput()).getValue()!;
    assert.equal(project.domainEvents.length, 0);
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => Project.create(buildCreateInput({ name: "" })));
  });
});

describe("Project.addTask", () => {
  it("cria e adiciona um Task, devolvendo a instância criada", () => {
    const project = Project.create(buildCreateInput()).getValue()!;
    const result = project.addTask({ title: "Configurar ambiente" });
    assert.equal(result.isSuccess, true);

    const task = result.getValue()!;
    assert.equal(task.title, "Configurar ambiente");
    assert.equal(task.status, "pending");
    assert.equal(project.getTasks().length, 1);
    assert.equal(project.getTasks()[0], task);
  });

  it("rejeita title vazio, sem adicionar o Task", () => {
    const project = Project.create(buildCreateInput()).getValue()!;
    const result = project.addTask({ title: "" });
    assert.equal(result.isFailure, true);
    assert.equal(project.getTasks().length, 0);
  });

  it("permite múltiplos Tasks no mesmo Project", () => {
    const project = Project.create(buildCreateInput()).getValue()!;
    project.addTask({ title: "Task 1" });
    project.addTask({ title: "Task 2" });
    assert.equal(project.getTasks().length, 2);
  });
});

describe("Project.findTask", () => {
  it("encontra um Task existente por id", () => {
    const project = Project.create(buildCreateInput()).getValue()!;
    const task = project.addTask({ title: "Task 1" }).getValue()!;
    assert.equal(project.findTask(task.id), task);
  });

  it("devolve undefined para um id inexistente", () => {
    const project = Project.create(buildCreateInput()).getValue()!;
    assert.equal(project.findTask(new UniqueEntityId()), undefined);
  });
});

describe("Project.reconstitute", () => {
  it("restaura um Project com suas Tasks, sem validar e sem disparar eventos", () => {
    const id = new UniqueEntityId();
    const now = new Date();
    const project = Project.reconstitute(
      { organizationId: new UniqueEntityId(), name: "Restaurado", createdAt: now, updatedAt: now },
      id,
      [],
    );
    assert.equal(project.id.equals(id), true);
    assert.equal(project.domainEvents.length, 0);
    assert.equal(project.getTasks().length, 0);
  });
});
