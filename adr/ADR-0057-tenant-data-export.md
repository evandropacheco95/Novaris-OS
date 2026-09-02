# ADR-0057 - Exportação/Portabilidade de Dados de um Tenant

## Problema

`architecture/multi-tenancy.md § Tópicos a Documentar` lista 2 itens pendentes para o NOVARIS virar um SaaS multi-tenant "completo" (sentido Salesforce Edições/Licenças). Um deles é puramente técnico e sem decisão de produto pendente: **nenhum endpoint ou processo existe hoje para exportar/portar os dados de uma Organization** para fora do NOVARIS.

## Contexto

- `FileRecord`/`FileStorage` (`services/kernel/files`, `ADR-0039`) já resolve exatamente "gerar um arquivo e disponibilizar download com isolamento de tenant real" — usado hoje por Marketing/`CampaignAsset` (`ADR-0048`) e pelo upload multipart genérico (`FilesController`). `DownloadFileHandler` já nega acesso cross-tenant (`record.organizationId !== command.organizationId` → `404`, não `403`, para não vazar existência).
- ~30 Aggregates/Entities de negócio têm `organizationId` direto ou via Aggregate pai (Sales, Customer, Project, Financial, Activity, Marketing, Analytics, Identity, System). Nenhum código hoje lê todas essas tabelas de uma vez — não existe precedente de leitura cross-domain em lote.
- `Credential` (Infrastructure, `password_hash`) é a única tabela relevante sem `organizationId` e com dado que nunca deve sair em uma exportação de dados de negócio (`ADR-0010`: "o domínio nunca conhece a senha em repouso").
- `apps/api/src/seed.ts` já é o precedente aceito de código que acessa `prisma` diretamente para uma operação que não modela nenhum invariante de negócio (bootstrap de dados), fora de qualquer pacote de Domain.

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. Rotina em `apps/api/src/organization/`, acesso direto a `prisma`, reaproveitando `UploadFileHandler`/`FileRecord` para armazenar e `GET /files/:id` para baixar** | Zero infraestrutura nova de storage/download; escopo mínimo; mesmo precedente de `seed.ts` para acesso direto a `prisma` | Escolhida |
| B. Novo Aggregate `TenantExport` no Organization Domain | Não há invariante de negócio a modelar — é uma leitura em lote seguida de 1 escrita de arquivo; inventaria estrutura sem fonte de spec (Constituição, Artigos 13/21) | Rejeitada |
| C. Lógica de leitura dentro de `@novaris/organizations` | Um pacote de Domain não deve conhecer o schema de outros 8 domínios — violaria a fronteira de Bounded Context já respeitada por toda a engenharia | Rejeitada |
| D. Novo mecanismo de storage/download dedicado ao export (ex.: rota própria `GET /organizations/export/:id`) | Duplicaria `FileRecord`/`FileStorage`/`GET /files/:id` já existentes e testados, sem ganho real | Rejeitada |
| E. Incluir `Credential` no export | Vazaria hash de senha em um arquivo de portabilidade de dados de negócio — contradiz `ADR-0010` | Rejeitada |

## Escolha

**Opção A.**

- `apps/api/src/organization/export-organization-data.ts` (novo): `ExportOrganizationDataHandler`, injeta `OrganizationRepository` (carrega `slug` para o nome do arquivo) + `UploadFileHandler` (`@novaris/files`, reaproveitado sem alteração). `execute(organizationId)`:
  1. Carrega a Organization (mesmo padrão de `loadOwnOrganization` já usado em `OrganizationController`).
  2. Lê todo modelo Prisma raiz com `organizationId` (lista explícita, comentada como "todo novo Aggregate com `organizationId` precisa entrar aqui manualmente" — mesmo trade-off já aceito por `FULL_PERMISSION_CATALOG` em `seed.ts`): `opportunity`, `salesChannel`, `pipeline`, `user`, `role`, `party`, `relationship`, `project`, `invoice`, `subscription`, `activity`, `campaign`, `dashboard`, `auditEntry`, `configurationEntry`, `featureFlag`, `fileRecord`, `automationRule`, `lead`, `product`, `quotation`, `case`, `comment`, `contract`, `revenue`, `calendarEvent`, `reminder`, `checklist`.
  3. Lê os 7 Internal Entities sem `organizationId` próprio via id do Aggregate pai já buscado: `stage`←`pipeline`, `proposal`←`opportunity`, `task`←`project`, `campaignAsset`←`campaign`, `widget`←`dashboard`, `quotationLineItem`←`quotation`, `checklistItem`←`checklist`.
  4. Serializa `{ exportedAt, organization, data: { <tabela>: [...] } }` como JSON → `Buffer`.
  5. Chama `uploadFileHandler.execute(new UploadFileCommand({ organizationId, filename: "export-<slug>-<timestamp>.json", mimeType: "application/json", content }))`.
  6. Retorna o `FileRecord` resultante.
- `OrganizationController`: novo `POST /organizations/export`, `@RequirePermission("workspace.data-export.manage")` (override de método, mesmo padrão de `workspace.plan.manage`, `ENG-0164`) — Permission distinta de `workspace.profile.manage` porque exportar 100% dos dados é mais sensível que editar o próprio perfil. Retorna `{ fileId, filename }`.
- Download do resultado usa `GET /files/:id` **sem nenhuma mudança** — continua exigindo `system.files.manage` (permissão já existente de `FilesController`), mesma exigência que já existe hoje para baixar qualquer `FileRecord` da Organization (ex.: um `CampaignAsset`). Não é uma lacuna nova.
- `files.module.ts`: ganha `exports: [UploadFileHandler, DownloadFileHandler]` (hoje sem `exports`) — primeiro consumidor externo do `FilesModule`.
- `organization.module.ts`: importa `FilesModule` para reaproveitar `UploadFileHandler` via DI.
- `seed.ts`: `workspace.data-export.manage` entra em `FULL_PERMISSION_CATALOG` — mesma paridade `SuperMaster`/`Usuario` já aplicada a todo o resto do catálogo (`ADR-0036`).
- Frontend: `/settings` ganha card "Exportar dados" com 1 botão, chamando `POST /organizations/export` e em seguida `downloadFile(fileId)` (função já existente em `lib/api.ts`, reaproveitada sem alteração).

## Consequências

- Toda Organization pode portar 100% dos próprios dados de negócio para fora do NOVARIS a qualquer momento, sem depender de suporte manual.
- Nenhuma infraestrutura nova de storage/download é criada — `FileRecord`/`FileStorage` ganham seu segundo caso de uso real (o primeiro foi `CampaignAsset`, `ADR-0048`), confirmando o Port como reaproveitável entre domínios.
- Todo novo Aggregate `organizationId`-scoped futuro precisa ser adicionado manualmente à lista em `export-organization-data.ts` — mesmo tipo de manutenção manual já aceito para `FULL_PERMISSION_CATALOG` (`seed.ts`) e `DOMAINS` (`dashboard-shell.tsx`); risco documentado, não escondido.
- `Credential` permanece definitivamente fora de qualquer export de dados de negócio.

## Responsável

Decisão de arquitetura direta (Claude Code / Principal Engineer) — item já registrado como pendência técnica em `architecture/multi-tenancy.md`, sem decisão de produto necessária (diferente do item irmão "cobrança real", que segue em aberto).

## Data

2026-08-25

## Impactos

- `apps/api/src/organization/export-organization-data.ts` (novo).
- `apps/api/src/organization/organization.controller.ts` — novo `POST /organizations/export`.
- `apps/api/src/organization/organization.module.ts` — importa `FilesModule`, registra `ExportOrganizationDataHandler`.
- `apps/api/src/files/files.module.ts` — novo `exports`.
- `apps/api/src/seed.ts` — novo código de Permission no catálogo.
- `apps/web/lib/api.ts`, `apps/web/app/settings/page.tsx` — novo card/botão.
- `architecture/multi-tenancy.md`, `MISSION_REGISTRY.md` — nova entrada (`ENG-0173`).

## Plano de Migração

Nenhum dado existente migrado — rota nova, sem comportamento anterior a preservar.

## Status

Aceito
