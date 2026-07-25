import { Module } from "@nestjs/common";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { prisma } from "@novaris/database";
import { createFileRecordRepository, LocalFileStorage, UploadFileHandler, DownloadFileHandler } from "@novaris/files";
import { AuthModule } from "../auth/auth.module.js";
import { FilesController } from "./files.controller.js";

const FILE_RECORD_REPOSITORY = "FILE_RECORD_REPOSITORY";
const FILE_STORAGE = "FILE_STORAGE";

/**
 * Diretório real de armazenamento local — `apps/api/storage-data/`, derivado
 * da localização deste módulo (não do `cwd` de quem inicia o processo, mesmo
 * padrão já usado em `main.ts` para `.env`). `ADR-0039`: disco local, não
 * nuvem — troca futura de adapter sem mudar o Port.
 */
const STORAGE_BASE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "storage-data");

/**
 * FilesModule — Composition Root de `files` (`ADR-0039`, `ENG-0140`).
 */
@Module({
  imports: [AuthModule],
  controllers: [FilesController],
  providers: [
    { provide: FILE_RECORD_REPOSITORY, useFactory: () => createFileRecordRepository(prisma) },
    { provide: FILE_STORAGE, useFactory: () => new LocalFileStorage(STORAGE_BASE_DIR) },
    {
      provide: UploadFileHandler,
      useFactory: (repository: ReturnType<typeof createFileRecordRepository>, storage: LocalFileStorage) => new UploadFileHandler(repository, storage),
      inject: [FILE_RECORD_REPOSITORY, FILE_STORAGE],
    },
    {
      provide: DownloadFileHandler,
      useFactory: (repository: ReturnType<typeof createFileRecordRepository>, storage: LocalFileStorage) => new DownloadFileHandler(repository, storage),
      inject: [FILE_RECORD_REPOSITORY, FILE_STORAGE],
    },
  ],
})
export class FilesModule {}
