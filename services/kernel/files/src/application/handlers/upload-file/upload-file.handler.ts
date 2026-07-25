import { randomUUID } from "node:crypto";
import { Result, UniqueEntityId, InfrastructureError } from "@novaris/shared-kernel";
import type { DomainError } from "@novaris/shared-kernel";
import { FileRecord } from "../../../domain/aggregates/file-record/file-record.js";
import type { FileRecordRepository } from "../../../domain/repositories/file-record-repository.js";
import type { FileStorage } from "../../../domain/ports/file-storage.js";
import type { UploadFileCommand } from "../../commands/upload-file/upload-file.command.js";

/**
 * UploadFileHandler — Application Layer, `files` (`ADR-0039`). `storagePath`
 * é namespaced por `organizationId` — mesmo isolamento de tenant já
 * reforçado em código por todo Repository/Controller desta engenharia,
 * aplicado aqui à árvore de diretórios do `FileStorage`.
 */
export class UploadFileHandler {
  constructor(
    private readonly fileRecordRepository: FileRecordRepository,
    private readonly fileStorage: FileStorage,
  ) {}

  async execute(command: UploadFileCommand): Promise<Result<FileRecord, DomainError | InfrastructureError>> {
    const organizationId = new UniqueEntityId(command.organizationId);
    const storagePath = `${organizationId.toValue()}/${randomUUID()}-${command.filename}`;

    const createResult = FileRecord.create({
      organizationId,
      filename: command.filename,
      mimeType: command.mimeType,
      sizeBytes: command.content.length,
      storagePath,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const record = createResult.getValue()!;

    try {
      await this.fileStorage.write(storagePath, command.content);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao escrever arquivo: ${error instanceof Error ? error.message : String(error)}`));
    }

    const saveResult = await this.fileRecordRepository.save(record);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(record);
  }
}
