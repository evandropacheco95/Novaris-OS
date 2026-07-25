# files

## Objetivo

Upload, armazenamento e recuperação de arquivos.

## Fase

Fase D — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md) e o plano de implementação.

## Interface Pública

Ver [CONTRACT.md](CONTRACT.md).

## Dependências

Nenhuma nesta versão — corrigido em `ENG-0140` (ver [CONTRACT.md § Dependências](CONTRACT.md)); `Storage` (controle de cota), citado originalmente, não é consumido.

## Eventos

Nenhum.

## Status

🟢 Real (`ENG-0140`, [ADR-0039](../../../adr/ADR-0039-remaining-kernel-infrastructure-adapters.md)). `FileRecord` (metadado) + `FileStorage`/`LocalFileStorage` (disco local) implementados de ponta a ponta (`@novaris/files`) — Domain/Application/Infrastructure (Prisma real + disco) + `POST /files`/`GET /files/:id`. Sem controle de cota (`storage/`, deliberadamente fora de escopo) e sem adapter de nuvem (troca futura, sem mudar o Port).
