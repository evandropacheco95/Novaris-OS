import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { FileStorage } from "../../domain/ports/file-storage.js";

/**
 * Adapter real do Port `FileStorage` — disco local, dentro de `baseDir`
 * (`ADR-0039`). Escolhido em vez de um bucket de nuvem (Supabase Storage,
 * S3) porque exigiria credenciais/bucket que não foram confirmados como já
 * configurados neste ambiente — decisão de infraestrutura externa
 * deliberadamente adiada, mesmo critério já usado para `ConsoleLogger`
 * (biblioteca) e `ConsoleNotifier` (canal externo). Substituível por um
 * adapter de nuvem sem mudar o Port nem quem o consome.
 */
export class LocalFileStorage implements FileStorage {
  constructor(private readonly baseDir: string) {}

  async write(path: string, content: Buffer): Promise<void> {
    const fullPath = join(this.baseDir, path);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content);
  }

  async read(path: string): Promise<Buffer> {
    return readFile(join(this.baseDir, path));
  }

  async delete(path: string): Promise<void> {
    await rm(join(this.baseDir, path), { force: true });
  }
}
