/**
 * Port de armazenamento de blob (`ENGINEERING_PLAYBOOK.md § 9`) — só bytes,
 * sem metadado (metadado é `FileRecord`, Aggregate separado). Adapter real
 * desta missão é disco local (`ADR-0039`); um adapter de nuvem (Supabase
 * Storage, S3) substitui sem mudar quem consome este Port.
 */
export interface FileStorage {
  write(path: string, content: Buffer): Promise<void>;
  read(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
}
