import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { FileRecord } from "../../../src/domain/aggregates/file-record/file-record.js";
import { PrismaFileRecordRepository } from "../../../src/infrastructure/repositories/prisma-file-record-repository.js";

describe("PrismaFileRecordRepository — integração real (Supabase)", () => {
  const repository = new PrismaFileRecordRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.fileRecord.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera um FileRecord real do Postgres", async () => {
    const record = FileRecord.create({
      organizationId: new UniqueEntityId(),
      filename: "contrato.pdf",
      mimeType: "application/pdf",
      sizeBytes: 2048,
      storagePath: "org-x/uuid-contrato.pdf",
    }).getValue()!;
    createdIds.push(record.id.toString());

    const saveResult = await repository.save(record);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const found = (await repository.findById(record.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.filename, "contrato.pdf");
    assert.equal(found.sizeBytes, 2048);
    assert.equal(found.storagePath, "org-x/uuid-contrato.pdf");
  });

  it("exists()/delete() funcionam contra o banco real", async () => {
    const record = FileRecord.create({
      organizationId: new UniqueEntityId(),
      filename: "temp.txt",
      mimeType: "text/plain",
      sizeBytes: 1,
      storagePath: "org-x/temp.txt",
    }).getValue()!;
    await repository.save(record);

    assert.equal((await repository.exists(record.id)).getValue(), true);
    await repository.delete(record.id);
    assert.equal((await repository.exists(record.id)).getValue(), false);
  });
});
