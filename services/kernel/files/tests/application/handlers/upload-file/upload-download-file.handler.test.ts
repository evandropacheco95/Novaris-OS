import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option } from "@novaris/shared-kernel";
import type { InfrastructureError } from "@novaris/shared-kernel";
import { FileRecord } from "../../../../src/domain/aggregates/file-record/file-record.js";
import type { FileRecordRepository } from "../../../../src/domain/repositories/file-record-repository.js";
import type { FileStorage } from "../../../../src/domain/ports/file-storage.js";
import { UploadFileHandler } from "../../../../src/application/handlers/upload-file/upload-file.handler.js";
import { UploadFileCommand } from "../../../../src/application/commands/upload-file/upload-file.command.js";
import { DownloadFileHandler } from "../../../../src/application/handlers/download-file/download-file.handler.js";
import { DownloadFileCommand } from "../../../../src/application/commands/download-file/download-file.command.js";

class FakeFileRecordRepository implements FileRecordRepository {
  private readonly records = new Map<string, FileRecord>();

  async findById(id: UniqueEntityId): Promise<Result<Option<FileRecord>, InfrastructureError>> {
    const found = this.records.get(id.toString());
    return Result.ok(found ? Option.some(found) : Option.none<FileRecord>());
  }

  async findAll(): Promise<Result<FileRecord[], InfrastructureError>> {
    return Result.ok(Array.from(this.records.values()));
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.records.has(id.toString()));
  }

  async save(entity: FileRecord): Promise<Result<void, InfrastructureError>> {
    this.records.set(entity.id.toString(), entity);
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.records.delete(id.toString());
    return Result.ok(undefined);
  }
}

class FakeFileStorage implements FileStorage {
  private readonly blobs = new Map<string, Buffer>();

  async write(path: string, content: Buffer): Promise<void> {
    this.blobs.set(path, content);
  }

  async read(path: string): Promise<Buffer> {
    const blob = this.blobs.get(path);
    if (!blob) {
      throw new Error(`arquivo não encontrado: ${path}`);
    }
    return blob;
  }

  async delete(path: string): Promise<void> {
    this.blobs.delete(path);
  }
}

describe("UploadFileHandler", () => {
  it("cria o FileRecord e escreve o conteúdo real via FileStorage", async () => {
    const repository = new FakeFileRecordRepository();
    const storage = new FakeFileStorage();
    const handler = new UploadFileHandler(repository, storage);

    const result = await handler.execute(
      new UploadFileCommand({ organizationId: new UniqueEntityId().toString(), filename: "contrato.pdf", mimeType: "application/pdf", content: Buffer.from("conteúdo") }),
    );

    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.filename, "contrato.pdf");
    assert.equal(result.getValue()!.sizeBytes, Buffer.from("conteúdo").length);

    const stored = await storage.read(result.getValue()!.storagePath);
    assert.equal(stored.toString(), "conteúdo");
  });
});

describe("UploadFileHandler + DownloadFileHandler — ciclo completo", () => {
  it("upload seguido de download devolve o mesmo conteúdo", async () => {
    const repository = new FakeFileRecordRepository();
    const storage = new FakeFileStorage();
    const uploadHandler = new UploadFileHandler(repository, storage);
    const downloadHandler = new DownloadFileHandler(repository, storage);
    const organizationId = new UniqueEntityId().toString();

    const uploadResult = await uploadHandler.execute(
      new UploadFileCommand({ organizationId, filename: "foto.png", mimeType: "image/png", content: Buffer.from("bytes-da-imagem") }),
    );
    const fileId = uploadResult.getValue()!.id.toString();

    const downloadResult = await downloadHandler.execute(new DownloadFileCommand({ organizationId, fileId }));

    assert.equal(downloadResult.isSuccess, true);
    assert.equal(downloadResult.getValue()!.content.toString(), "bytes-da-imagem");
    assert.equal(downloadResult.getValue()!.record.filename, "foto.png");
  });

  it("download de um fileId de outra organização devolve NotFoundError (não vaza existência)", async () => {
    const repository = new FakeFileRecordRepository();
    const storage = new FakeFileStorage();
    const uploadHandler = new UploadFileHandler(repository, storage);
    const downloadHandler = new DownloadFileHandler(repository, storage);

    const uploadResult = await uploadHandler.execute(
      new UploadFileCommand({ organizationId: new UniqueEntityId().toString(), filename: "x.txt", mimeType: "text/plain", content: Buffer.from("x") }),
    );
    const fileId = uploadResult.getValue()!.id.toString();

    const downloadResult = await downloadHandler.execute(new DownloadFileCommand({ organizationId: new UniqueEntityId().toString(), fileId }));

    assert.equal(downloadResult.isFailure, true);
    assert.equal(downloadResult.getError()!.code, "NOT_FOUND_ERROR");
  });

  it("download de um fileId inexistente devolve NotFoundError", async () => {
    const repository = new FakeFileRecordRepository();
    const storage = new FakeFileStorage();
    const downloadHandler = new DownloadFileHandler(repository, storage);

    const result = await downloadHandler.execute(new DownloadFileCommand({ organizationId: new UniqueEntityId().toString(), fileId: new UniqueEntityId().toString() }));

    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "NOT_FOUND_ERROR");
  });
});
