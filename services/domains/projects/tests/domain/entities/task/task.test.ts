import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Task } from "../../../../domain/entities/task/task.js";

describe("Task.create", () => {
  it("cria um Task válido no status \"pending\"", () => {
    const result = Task.create({ title: "Configurar ambiente" });
    assert.equal(result.isSuccess, true);

    const task = result.getValue()!;
    assert.equal(task.title, "Configurar ambiente");
    assert.equal(task.status, "pending");
  });

  it("rejeita title vazio", () => {
    const result = Task.create({ title: "" });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita title só com espaços", () => {
    const result = Task.create({ title: "   " });
    assert.equal(result.isFailure, true);
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => Task.create({ title: "" }));
  });
});

describe("Task.updateStatus", () => {
  it("aceita os 4 estados nomeados em BOM.md", () => {
    const statuses = ["pending", "in_progress", "completed", "cancelled"] as const;
    for (const status of statuses) {
      const task = Task.create({ title: "Task" }).getValue()!;
      const result = task.updateStatus(status);
      assert.equal(result.isSuccess, true, `status "${status}" deveria ser aceito`);
      assert.equal(task.status, status);
    }
  });

  it("rejeita status fora da união conhecida", () => {
    const task = Task.create({ title: "Task" }).getValue()!;
    const result = task.updateStatus("invalido" as never);
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
    assert.equal(task.status, "pending", "status não deve mudar quando a validação falha");
  });

  it("nunca lança exceção", () => {
    const task = Task.create({ title: "Task" }).getValue()!;
    assert.doesNotThrow(() => task.updateStatus("completed"));
  });
});

describe("Task.reconstitute", () => {
  it("restaura um Task sem validar", () => {
    const id = new UniqueEntityId();
    const now = new Date();
    const task = Task.reconstitute({ title: "Restaurado", status: "completed", createdAt: now, updatedAt: now }, id);
    assert.equal(task.id.equals(id), true);
    assert.equal(task.status, "completed");
  });
});
