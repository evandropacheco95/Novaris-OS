import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Comment } from "../../../../domain/aggregates/comment/comment.js";

describe("Comment.create", () => {
  it("cria um Comment válido", () => {
    const result = Comment.create({
      organizationId: new UniqueEntityId(),
      targetType: "lead",
      targetId: new UniqueEntityId(),
      authorUserId: new UniqueEntityId(),
      body: "Cliente confirmou reunião para sexta.",
    });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.targetType, "lead");
  });

  it("aceita qualquer targetType (deliberadamente polimórfico, sem enum fechado)", () => {
    const result = Comment.create({
      organizationId: new UniqueEntityId(),
      targetType: "case",
      targetId: new UniqueEntityId(),
      authorUserId: new UniqueEntityId(),
      body: "x",
    });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.targetType, "case");
  });

  it("rejeita targetType vazio", () => {
    const result = Comment.create({
      organizationId: new UniqueEntityId(),
      targetType: "",
      targetId: new UniqueEntityId(),
      authorUserId: new UniqueEntityId(),
      body: "x",
    });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita body vazio", () => {
    const result = Comment.create({
      organizationId: new UniqueEntityId(),
      targetType: "lead",
      targetId: new UniqueEntityId(),
      authorUserId: new UniqueEntityId(),
      body: "  ",
    });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("dispara exatamente um CommentCreated", () => {
    const comment = Comment.create({
      organizationId: new UniqueEntityId(),
      targetType: "lead",
      targetId: new UniqueEntityId(),
      authorUserId: new UniqueEntityId(),
      body: "x",
    }).getValue()!;
    assert.equal(comment.domainEvents.length, 1);
    assert.equal(comment.domainEvents[0]!.eventName, "CommentCreated");
  });
});

describe("Comment.updateBody", () => {
  it("edita o corpo sem disparar novo evento", () => {
    const comment = Comment.create({
      organizationId: new UniqueEntityId(),
      targetType: "lead",
      targetId: new UniqueEntityId(),
      authorUserId: new UniqueEntityId(),
      body: "original",
    }).getValue()!;
    const result = comment.updateBody("editado");
    assert.equal(result.isSuccess, true);
    assert.equal(comment.body, "editado");
    assert.equal(comment.domainEvents.length, 1); // só o CommentCreated original
  });

  it("rejeita body vazio na edição", () => {
    const comment = Comment.create({
      organizationId: new UniqueEntityId(),
      targetType: "lead",
      targetId: new UniqueEntityId(),
      authorUserId: new UniqueEntityId(),
      body: "original",
    }).getValue()!;
    const result = comment.updateBody("");
    assert.equal(result.isFailure, true);
    assert.equal(comment.body, "original");
  });
});
