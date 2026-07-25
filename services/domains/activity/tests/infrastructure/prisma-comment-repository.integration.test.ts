import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Comment } from "../../domain/aggregates/comment/comment.js";
import { PrismaCommentRepository } from "../../infrastructure/repositories/prisma-comment-repository.js";

describe("PrismaCommentRepository — integração real (Supabase)", () => {
  const repository = new PrismaCommentRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.comment.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera um Comment real do Postgres", async () => {
    const comment = Comment.create({
      organizationId: new UniqueEntityId(),
      targetType: "lead",
      targetId: new UniqueEntityId(),
      authorUserId: new UniqueEntityId(),
      body: "Cliente confirmou reunião.",
    }).getValue()!;
    createdIds.push(comment.id.toString());

    const saveResult = await repository.save(comment);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const found = (await repository.findById(comment.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.targetType, "lead");
    assert.equal(found.body, "Cliente confirmou reunião.");
  });

  it("persiste updateBody()", async () => {
    const comment = Comment.create({
      organizationId: new UniqueEntityId(),
      targetType: "case",
      targetId: new UniqueEntityId(),
      authorUserId: new UniqueEntityId(),
      body: "original",
    }).getValue()!;
    createdIds.push(comment.id.toString());
    await repository.save(comment);

    comment.updateBody("editado");
    await repository.save(comment);

    const found = (await repository.findById(comment.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.body, "editado");
  });

  it("exists()/delete() funcionam contra o banco real (hard delete)", async () => {
    const comment = Comment.create({
      organizationId: new UniqueEntityId(),
      targetType: "lead",
      targetId: new UniqueEntityId(),
      authorUserId: new UniqueEntityId(),
      body: "temporário",
    }).getValue()!;
    await repository.save(comment);

    assert.equal((await repository.exists(comment.id)).getValue(), true);
    await repository.delete(comment.id);
    assert.equal((await repository.exists(comment.id)).getValue(), false);
  });
});
