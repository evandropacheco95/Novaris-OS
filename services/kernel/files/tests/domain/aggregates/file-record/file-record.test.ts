import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { FileRecord } from "../../../../src/domain/aggregates/file-record/file-record.js";

describe("FileRecord.create", () => {
  it("cria um FileRecord válido", () => {
    const result = FileRecord.create({
      organizationId: new UniqueEntityId(),
      filename: "contrato.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024,
      storagePath: "org-1/abc-contrato.pdf",
    });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.filename, "contrato.pdf");
    assert.equal(result.getValue()!.sizeBytes, 1024);
  });

  it("rejeita filename vazio", () => {
    const result = FileRecord.create({ organizationId: new UniqueEntityId(), filename: "  ", mimeType: "text/plain", sizeBytes: 1, storagePath: "x" });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita sizeBytes negativo", () => {
    const result = FileRecord.create({ organizationId: new UniqueEntityId(), filename: "x.txt", mimeType: "text/plain", sizeBytes: -1, storagePath: "x" });
    assert.equal(result.isFailure, true);
  });

  it("aceita sizeBytes zero (arquivo vazio é um caso válido)", () => {
    const result = FileRecord.create({ organizationId: new UniqueEntityId(), filename: "vazio.txt", mimeType: "text/plain", sizeBytes: 0, storagePath: "x" });
    assert.equal(result.isSuccess, true);
  });
});

describe("FileRecord.reconstitute", () => {
  it("recria sem validar", () => {
    const id = new UniqueEntityId();
    const record = FileRecord.reconstitute(
      { organizationId: new UniqueEntityId(), filename: "x", mimeType: "text/plain", sizeBytes: 1, storagePath: "p", createdAt: new Date() },
      id,
    );
    assert.equal(record.id.equals(id), true);
  });
});
