import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { FileRecord } from "../aggregates/file-record/file-record.js";

export interface FileRecordRepository extends ReadRepository<FileRecord>, WriteRepository<FileRecord> {}
