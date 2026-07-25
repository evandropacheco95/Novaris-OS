# ADR-0048: Asset — reaproveita FileRecord (Kernel), associado a Campaign

## Status

Aceita.

## Contexto

`Asset` (`BOM.md § Asset`, "Recurso digital.") ficou explicitamente bloqueado desde `ADR-0033`: "posse (Marketing vs. transversal) permanece em aberto" — nenhuma fonte definia se `Asset` pertence ao Marketing Domain ou é um conceito transversal de Kernel.

Investigação prévia (antes de perguntar ao CTO) encontrou uma peça de evidência real: `@novaris/files` (Kernel, `ADR-0039`, `ENG-0140`) já implementa `FileRecord` — um Aggregate Root genérico e funcional (`organizationId`/`filename`/`mimeType`/`sizeBytes`/`storagePath`), com upload/download reais (`POST`/`GET /files`), sem nenhuma associação com `Campaign` hoje.

Perguntado diretamente, o CTO confirmou: `Asset` deve reaproveitar `FileRecord` (não duplicar o conceito de armazenamento de arquivo), só adicionando a associação com `Campaign` que falta hoje.

## Decision Drivers

- `FileRecord` já resolve genericamente "arquivo enviado, com metadado" — criar um segundo Aggregate `Asset` com os mesmos campos (`filename`/`mimeType`/`sizeBytes`) duplicaria responsabilidade já implementada e testada.
- O que falta não é armazenamento de arquivo — é a **associação** entre um arquivo já enviado e uma Campaign. Isso é modelado como uma Internal Entity de `Campaign` (mesmo padrão de `QuotationLineItem`/`ChecklistItem`), referenciando `FileRecord` por id — nunca embutindo o Aggregate `FileRecord` inteiro.
- Mantém `@novaris/files` (Kernel) sem nenhuma dependência de `@novaris/marketing` — a composição é unidirecional (Marketing→Kernel via injeção de `FileRecordRepository`, mesmo padrão já usado por `AddQuotationLineItemHandler`→`ProductRepository`), preservando a regra de Kernel nunca depender de Business Domain.

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. `Asset` = Internal Entity de `Campaign`, referenciando `FileRecord` por id** | Reaproveita `FileRecord` já implementado; só adiciona a associação que faltava | Escolhida |
| B. Duplicar campos de `FileRecord` dentro de um novo Aggregate `Asset` | Evitaria a composição Marketing→Kernel | Rejeitada — duplica responsabilidade já resolvida, viola DRY sem necessidade real |
| C. `Asset` como Aggregate Root próprio, independente de Campaign | Permitiria Asset sem Campaign | Rejeitada — nenhuma fonte sustenta um caso de uso de Asset "solto"; toda menção a Asset nesta sessão sempre foi no contexto de Campaign |

## Decision

**Opção A.**

- `Asset` (Internal Entity de `Campaign`, Marketing Domain): `fileRecordId` (referência, não embute `FileRecord`), `addedAt`.
- `Campaign` ganha a coleção `assets: Asset[]` e o método `addAsset(fileRecordId)`.
- `AddAssetToCampaignHandler` (Application, composição Marketing→Kernel): injeta `FileRecordRepository` (de `@novaris/files`) para confirmar que o `FileRecord` referenciado existe antes de criar a associação — mesmo princípio de `AddQuotationLineItemHandler` confirmando o `Product` real.
- Upload do arquivo em si continua via `POST /files` (já existente, `@novaris/files`) — a Application Layer de Marketing nunca reimplementa upload/storage.
- Sem Domain Event — nenhuma fonte confirma um evento para `Asset`, mesmo critério já aplicado a `Product`/`Revenue`.

## Consequences

- Nova tabela `campaign_assets` (Postgres) — Internal Entity com tabela própria, mesmo padrão de `quotation_line_items`/`checklist_items`. `file_record_id` sem FK para `files` (mesma decisão de desacoplamento entre tabelas de domínios diferentes já usada em toda esta engenharia).
- `PrismaCampaignRepository.save()` passa a sincronizar `assets` transacionalmente, mesmo padrão de `PrismaQuotationRepository` para `lineItems`.
- Novo código de Permission (`marketing.campaigns.manage` já existe e cobre a nova rota — Asset não ganha Permission própria, é uma sub-ação de Campaign).
- `MARKETING_AGGREGATE_DESIGN.md § 3` e `BOM.md § Asset` recebem nota de resolução não-destrutiva.

## Responsável

CTO / Arquiteto Chefe — decisão explícita, confirmando a proposta apresentada (reaproveitar `FileRecord`).

## Data

2026-07-25

## Plano de Migração

Nenhum — objeto novo, sem dado existente para migrar.

## Status

Aceito
