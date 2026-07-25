import { Result, UniqueEntityId, NotFoundError, InfrastructureError } from "@novaris/shared-kernel";
import type { DomainError } from "@novaris/shared-kernel";
import type { FileRecord } from "../../../domain/aggregates/file-record/file-record.js";
import type { FileRecordRepository } from "../../../domain/repositories/file-record-repository.js";
import type { FileStorage } from "../../../domain/ports/file-storage.js";
import type { DownloadFileCommand } from "../../commands/download-file/download-file.command.js";

export interface DownloadedFile {
  readonly record: FileRecord;
  readonly content: Buffer;
}

/**
 * DownloadFileHandler — Application Layer, `files` (`ADR-0039`). `NotFoundError`
 * tanto para `fileId` inexistente quanto para `fileId` de outra organização —
 * mesmo critério de "não vazar existência" já usado por `PartyController`
 * (nunca `403`, sempre `404` para não confirmar a existência de um recurso
 * de outro tenant).
 */
export class DownloadFileHandler {
  constructor(
    private readonly fileRecordRepository: FileRecordRepository,
    private readonly fileStorage: FileStorage,
  ) {}

  async execute(command: DownloadFileCommand): Promise<Result<DownloadedFile, DomainError | InfrastructureError>> {
    const findResult = await this.fileRecordRepository.findById(new UniqueEntityId(command.fileId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Arquivo "${command.fileId}" não encontrado`));
    }
    const record = option.getOrElse(null as never);
    if (record.organizationId.toString() !== command.organizationId) {
      return Result.fail(new NotFoundError(`Arquivo "${command.fileId}" não encontrado`));
    }

    try {
      const content = await this.fileStorage.read(record.storagePath);
      return Result.ok({ record, content });
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao ler arquivo: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
}
