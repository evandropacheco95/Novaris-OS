// Files Service — barrel de exportação pública.

export {
  FileRecord,
  type FileRecordProps,
  type CreateFileRecordInput,
} from "./domain/aggregates/file-record/file-record.js";
export type { FileRecordRepository } from "./domain/repositories/file-record-repository.js";
export type { FileStorage } from "./domain/ports/file-storage.js";

export { UploadFileCommand } from "./application/commands/upload-file/upload-file.command.js";
export { UploadFileHandler } from "./application/handlers/upload-file/upload-file.handler.js";
export { DownloadFileCommand } from "./application/commands/download-file/download-file.command.js";
export { DownloadFileHandler, type DownloadedFile } from "./application/handlers/download-file/download-file.handler.js";

export { createFileRecordRepository } from "./infrastructure/factories.js";
export { LocalFileStorage } from "./infrastructure/storage/local-file-storage.js";
