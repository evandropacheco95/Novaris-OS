import { UniqueEntityId } from "@novaris/shared-kernel";
import type { FileRecord as PrismaFileRecord } from "@novaris/database";
import { FileRecord } from "../../domain/aggregates/file-record/file-record.js";

export class PrismaFileRecordMapper {
  static toDomain(record: PrismaFileRecord): FileRecord {
    return FileRecord.reconstitute(
      {
        organizationId: new UniqueEntityId(record.organizationId),
        filename: record.filename,
        mimeType: record.mimeType,
        sizeBytes: record.sizeBytes,
        storagePath: record.storagePath,
        createdAt: record.createdAt,
      },
      new UniqueEntityId(record.id),
    );
  }

  static toPersistence(record: FileRecord): PrismaFileRecord {
    return {
      id: record.id.toString(),
      organizationId: record.organizationId.toString(),
      filename: record.filename,
      mimeType: record.mimeType,
      sizeBytes: record.sizeBytes,
      storagePath: record.storagePath,
      createdAt: record.createdAt,
    };
  }
}
