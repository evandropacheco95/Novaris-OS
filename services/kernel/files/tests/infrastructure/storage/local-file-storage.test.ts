import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { rm } from "node:fs/promises";
import { LocalFileStorage } from "../../../src/infrastructure/storage/local-file-storage.js";

describe("LocalFileStorage — disco real (diretório temporário)", () => {
  const baseDir = join(tmpdir(), `novaris-files-test-${randomUUID()}`);
  const storage = new LocalFileStorage(baseDir);

  after(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  it("escreve e lê o mesmo conteúdo de volta", async () => {
    const content = Buffer.from("conteúdo real do arquivo");
    await storage.write("org-1/arquivo.txt", content);

    const read = await storage.read("org-1/arquivo.txt");
    assert.equal(read.toString(), "conteúdo real do arquivo");
  });

  it("cria os diretórios intermediários automaticamente", async () => {
    await storage.write("org-2/subpasta/profunda/arquivo.txt", Buffer.from("x"));
    const read = await storage.read("org-2/subpasta/profunda/arquivo.txt");
    assert.equal(read.toString(), "x");
  });

  it("delete() remove o arquivo — leitura subsequente falha", async () => {
    await storage.write("org-3/temp.txt", Buffer.from("temporário"));
    await storage.delete("org-3/temp.txt");

    await assert.rejects(() => storage.read("org-3/temp.txt"));
  });

  it("delete() de um arquivo inexistente não lança (force: true)", async () => {
    await assert.doesNotReject(() => storage.delete("nunca-existiu.txt"));
  });
});
