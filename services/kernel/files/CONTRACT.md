# Contrato de Serviço — files

## Objetivo

Upload, armazenamento e recuperação de arquivos. Implementado real em `ENG-0140`/`ADR-0039`.

## Interface Pública

```typescript
class UploadFileCommand { organizationId: string; filename: string; mimeType: string; content: Buffer }
class UploadFileHandler { execute(command): Promise<Result<FileRecord, DomainError | InfrastructureError>> }
class DownloadFileCommand { organizationId: string; fileId: string }
class DownloadFileHandler { execute(command): Promise<Result<DownloadedFile, DomainError | InfrastructureError>> }

interface FileStorage {
  write(path: string, content: Buffer): Promise<void>;
  read(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
}
```

## Entradas/Saídas

| Função | Entrada | Saída | Observação |
|---|---|---|---|
| `UploadFileHandler.execute` | `organizationId`, `filename`, `mimeType`, `content: Buffer` | `Result<FileRecord, ...>` | `storagePath` gerado internamente (`{organizationId}/{uuid}-{filename}`), nunca aceito do chamador |
| `DownloadFileHandler.execute` | `organizationId`, `fileId` | `Result<DownloadedFile, ...>` | `NotFoundError` tanto para `fileId` inexistente quanto de outra organização — nunca vaza existência de arquivo alheio |

## Erros

`ValidationError` (filename vazio, sizeBytes negativo). `NotFoundError` (arquivo não encontrado ou de outra organização). `InfrastructureError` (falha de disco ou de persistência do metadado).

## Eventos Emitidos

Nenhum.

## Dependências

**Correção (`ENG-0140`)**: a versão anterior citava `Storage` como dependência (controle de cota). `storage/` permanece deliberadamente sem implementação (`ADR-0039`) — `files` não depende dele nesta versão, funciona sem qualquer controle de cota/limite.

## Object Specification

Não aplicável — infraestrutura transversal; `FileRecord` é um Aggregate mínimo definido só por `ADR-0039`, não um Business Object do BOM.

## Status

🟢 Real (`ENG-0140`, `ADR-0039`). `FileRecord` (Aggregate Root, metadado) + `FileStorage`/`LocalFileStorage` (Port + Infrastructure, disco local) + Application (Upload/Download Handlers) implementados e testados (unitários + integração real). Exposto via `POST /files` (multipart) e `GET /files/:id` (`apps/api`). **Sem controle de cota** — responsabilidade de `storage/`, deliberadamente fora de escopo (nenhuma regra de plano/limite existe em `Subscription`, `ADR-0031`). **Disco local, não nuvem** — Supabase Storage/S3 é uma troca de adapter futura, sem mudar o Port.
