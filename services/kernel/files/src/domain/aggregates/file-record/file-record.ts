import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError } from "@novaris/shared-kernel";

/**
 * FileRecord — Aggregate Root do Kernel `files` (Fase D, `ADR-0039`).
 * Metadado do arquivo — o conteúdo em si (bytes) vive em `FileStorage`
 * (Infrastructure Port), referenciado aqui só por `storagePath`. Controle de
 * cota por organização (responsabilidade de `storage/`) deliberadamente fora
 * de escopo — nenhuma regra de plano/limite existe (`ADR-0039 § Contexto`).
 */
export interface FileRecordProps {
  organizationId: UniqueEntityId;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  createdAt: Date;
}

export interface CreateFileRecordInput {
  organizationId: UniqueEntityId;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
}

export class FileRecord extends AggregateRoot<FileRecordProps> {
  private constructor(props: FileRecordProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateFileRecordInput): Result<FileRecord, DomainError> {
    if (input.filename.trim().length === 0) {
      return Result.fail(new ValidationError('"filename" não pode ser vazio'));
    }
    if (input.sizeBytes < 0) {
      return Result.fail(new ValidationError('"sizeBytes" não pode ser negativo'));
    }
    return Result.ok(
      new FileRecord({
        organizationId: input.organizationId,
        filename: input.filename,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        storagePath: input.storagePath,
        createdAt: new Date(),
      }),
    );
  }

  static reconstitute(props: FileRecordProps, id: UniqueEntityId): FileRecord {
    return new FileRecord(props, id);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get filename(): string {
    return this.props.filename;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get sizeBytes(): number {
    return this.props.sizeBytes;
  }

  get storagePath(): string {
    return this.props.storagePath;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
