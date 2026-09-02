# OBJECT SPECIFICATION

------------------------------------------------------------

OBJECT NAME

Advertising Account

------------------------------------------------------------

DOMAIN

Advertising (`ADR-0059`)

------------------------------------------------------------

VERSION

0.1.0

------------------------------------------------------------

STATUS

🚧 Parcial — escrito para desbloquear a Fase 01 de `NOVARIS Performance Intelligence` (`ADR-0058`/`ADR-0059`), `Article V` da `NOVARIS_CONSTITUTION.md`. Capítulos sem fonte real (IA, Automações, Dashboards) marcados `TODO` — não inventados.

------------------------------------------------------------

OWNER

NOVARIS Engineering Team

------------------------------------------------------------

CLASSIFICATION

Business Object (Advertising Domain)

------------------------------------------------------------

# 1. Objetivo

Representa uma conta de anúncio de uma plataforma de mídia paga externa (Google Ads inicialmente, `ADR-0058`) conectada a uma `Organization` do NOVARIS. É o ponto de entrada de todo o ciclo operacional de `NOVARIS Performance Intelligence` — nenhuma campanha, sinal, diagnóstico ou recomendação existe sem uma `Advertising Account` primeiro.

---

# 2. Problema que resolve

Antes deste objeto, não havia nenhuma forma de o NOVARIS saber que uma `Organization` (ex.: Winnet Metais) tem uma conta Google Ads que deveria ser monitorada. Sem ele, a Fase 02 (Google Ads Integration) não teria onde persistir a relação `Organization` ↔ conta externa nem o estado de conexão.

---

# 3. Responsabilidades

✔ Registrar que uma `Organization` tem uma conta de anúncio em uma plataforma externa

✔ Rastrear o estado de conexão (`connectionStatus`) — nunca simular saúde de conexão inexistente (master doc, princípio "nunca inventar dado")

✔ Guardar o identificador externo (`externalAccountId`) da conta, quando conectada

✔ Registrar quando a conta foi conectada e quando sincronizou pela última vez

---

# 4. Não Responsabilidades

✘ Não executa autenticação OAuth nem chama a API do Google Ads — isso é responsabilidade do `GoogleAdsProvider` (`kernel/integration-hub`), consumido pela Fase 02

✘ Não armazena campanhas, grupos de anúncio, palavras-chave ou termos de busca — esses são `Ad Campaign`/`Ad Group`/`Keyword`/`Search Term` (Advertising Domain, propostos, sem Object Specification ainda, `ADR-0059`)

✘ Não armazena métricas de performance — isso é `PerformanceSnapshot` (Analytics Domain, já previsto em `DOMAIN_MODEL.md`, ainda não implementado)

✘ Não decide nem executa sincronização automática — isso é `Sync Run` (proposto, `ADR-0059`), fora do escopo desta especificação

---

# 5. Atributos

| Nome | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | UUID | Sim | Identificador interno, gerado pelo NOVARIS |
| `organizationId` | UUID | Sim | `Organization` proprietária (isolamento multi-tenant, `Article III`) |
| `provider` | string | Sim | Plataforma externa. Único valor válido hoje: `"google_ads"` (`ADR-0058` — Meta Ads é escopo futuro, não implementado) |
| `externalAccountId` | string \| null | Não | ID da conta na plataforma externa (ex.: Customer ID do Google Ads). `null` até a conta ser efetivamente conectada (Fase 02) |
| `name` | string | Sim | Rótulo definido por um humano ao registrar a conta (ex.: "Winnet Metais — Google Ads") — não inventado, nunca derivado automaticamente do `externalAccountId` |
| `connectionStatus` | enum | Sim | `NOT_CONNECTED` \| `CONNECTED` \| `SYNC_REQUIRED` \| `SYNCING` \| `SYNC_FAILED` — subconjunto dos estados de sistema de `specifications/performance-intelligence/screens.md`, aplicável a nível de conta. Default na criação: `NOT_CONNECTED` |
| `connectedAt` | timestamp \| null | Não | Quando a conexão foi confirmada pela primeira vez. `null` enquanto `connectionStatus = NOT_CONNECTED` |
| `lastSyncAt` | timestamp \| null | Não | Quando a última sincronização de dados foi concluída. `null` até a primeira sincronização real |
| `encryptedRefreshToken` | string \| null | Não | Refresh token OAuth cifrado (AES-256-GCM, `ADR-0060`) — preenchido só por `connect()`. Nunca decifrado dentro do Aggregate (Domain Layer não faz I/O); decifra-se só na Infrastructure Layer, no momento de chamar o `GoogleAdsProvider` |
| `createdAt` | timestamp | Sim | Padrão |
| `updatedAt` | timestamp | Sim | Padrão |

---

# 6. Estados

`connectionStatus`: `NOT_CONNECTED` (inicial) → `CONNECTED` (`connect()`) → `SYNC_REQUIRED` (`requestSync()`) → `SYNCING` (`startSync()`) → `CONNECTED` (`completeSync()`) ou `SYNC_FAILED` (`failSync()`). De `SYNC_FAILED`, `requestSync()` permite tentar de novo (mesma transição já válida a partir de `CONNECTED`).

Nenhum estado de exclusão lógica (`deletedAt`)/desconexão definido nesta versão — nenhuma fonte confirma se desconectar uma conta deve arquivá-la ou apagá-la; `TODO`.

---

# 7. Ciclo de Vida

```
Registrada (NOT_CONNECTED, criada por um humano via API)
  ↓
Conectada (CONNECTED — connect(), OAuth real via GoogleAdsProvider, ADR-0060)
  ↓
Sincronização solicitada (SYNC_REQUIRED — requestSync())
  ↓
Sincronizando (SYNCING — startSync())
  ↓
Sincronizada (CONNECTED, lastSyncAt atualizado — completeSync()) ou Falhou (SYNC_FAILED — failSync())
```

Fase 01 implementou só `Registrada` (`create()`). **Fase 02 (`ADR-0060`) implementa as 5 transições restantes** (`connect()`, `requestSync()`, `startSync()`, `completeSync()`, `failSync()`) — cada uma valida o estado de origem e falha com `ConflictError` se a transição não for permitida (mesmo padrão de `Opportunity.markWon()`).

---

# 8. Relacionamentos

Pertence a uma `Organization` (Kernel, `organizationId`).

Terá `Ad Campaign` (proposto) quando a Fase 02 implementar sincronização — relação não implementada nesta versão.

---

# 9. Eventos

Fase 01: nenhum Domain Event. **Fase 02 (`ADR-0060`) implementa 3**: `AdvertisingAccountConnected` (em `connect()`), `AdvertisingAccountSyncCompleted` (em `completeSync()`), `AdvertisingAccountSyncFailed` (em `failSync()`). `requestSync()`/`startSync()` não disparam evento — nenhuma fonte confirma consumidor para eles (mesmo critério de `Opportunity.advanceStage()`).

---

# 10. Regras de Negócio

01. `provider` deve ser um valor da lista fechada de plataformas suportadas (hoje: só `"google_ads"`)

02. `name` é obrigatório e não pode ser vazio

03. `connectionStatus` deve ser um dos 5 valores definidos — nenhum outro valor é aceito

04. `externalAccountId`/`connectedAt`/`lastSyncAt`/`encryptedRefreshToken` só podem ser preenchidos por `connect()` — `create()` nunca os preenche

05. `connect()` só é permitido a partir de `NOT_CONNECTED`; `requestSync()` a partir de `CONNECTED` ou `SYNC_FAILED`; `startSync()` só a partir de `SYNC_REQUIRED`; `completeSync()`/`failSync()` só a partir de `SYNCING` — qualquer outra origem falha com `ConflictError` (`ADR-0060`)

---

# 11. Permissões

Ver `specifications/performance-intelligence/permissions.md`: `advertising.ad-accounts.manage` (conectar/desconectar, disparar sincronização) — única Permission usada pelo Controller desta versão (create/list/oauth/sync). **Corrigido em `ADR-0060`**: a versão anterior deste capítulo citava `performance-intelligence.ad-accounts.manage` (prefixo de produto), desatualizado desde que `ADR-0059` criou o Advertising Domain — a convenção real do repositório é prefixar por domínio (`marketing.campaigns.manage`, `sales.leads.manage`), não por produto.

---

# 12. APIs

`POST /performance-intelligence/ad-accounts` — registra uma `Advertising Account` (`connectionStatus = NOT_CONNECTED`).

`GET /performance-intelligence/ad-accounts` — lista as contas da `Organization` autenticada.

`GET /performance-intelligence/ad-accounts/:id/oauth/start` — retorna a URL de consentimento OAuth do Google (Fase 02, `ADR-0060`).

`GET /performance-intelligence/ad-accounts/oauth/callback` — troca o `code` OAuth por tokens, cifra o refresh token, chama `connect()` (Fase 02, `ADR-0060`).

`POST /performance-intelligence/ad-accounts/:id/sync` — dispara sincronização manual (Fase 02, `ADR-0060`).

---

# 13. Banco

Tabela: `advertising_accounts` (`packages/database/prisma/schema.prisma`).

Índices: `organizationId`.

Constraints: nenhuma constraint de unicidade em `externalAccountId` nesta versão — `null` é o valor mais comum enquanto não há contas conectadas de fato. `ADR-0060` não adicionou essa constraint (mantido como risco aberto, § 19) — decisão explicitamente adiada, não esquecida.

Policies: RLS por `organizationId`, mesmo padrão de `Campaign`/`Dashboard` — sujeito à mesma ressalva já documentada em `ADR-0057` (`rolbypassrls = true` na role do Prisma; isolamento real depende do Controller extrair `organizationId` do token, nunca de input).

Views/RPCs: nenhuma.

---

# 14. IA

`TODO` — Fase 06 (AI Diagnostics) definirá como os agentes de IA usam este objeto (hoje nenhum agente de IA real existe, `ai-runtime` sem chamada configurada).

---

# 15. Automações

`TODO` — nenhum workflow de automação usa este objeto ainda.

---

# 16. Dashboards

`TODO` — Fase 12 (Dashboard e UX) definirá quais KPIs desta conta aparecem nas telas de `specifications/performance-intelligence/screens.md`.

---

# 17. Auditoria

Fase 01: não implementado. **Fase 02 (`ADR-0060`)**: `ConnectAdvertisingAccountHandler` (Application Layer) registra uma `AuditEntry` via `CreateAuditEntryHandler` (`kernel/audit`) depois de `connect()` bem-sucedido — mesmo padrão de `UpdateOrganizationProfileHandler` (`ADR-0035`): falha ao auditar nunca reverte a conexão já persistida.

---

# 18. Dependências

`kernel/organizations` (`organizationId` referenciado sem FK física, mesmo padrão de desacoplamento Kernel↔Business Domain já usado em `CampaignAsset`/`FileRecord`).

`kernel/integration-hub` (`GoogleAdsProvider`) — consumido a partir da Fase 02 (`ADR-0060`).

`kernel/audit` (`CreateAuditEntryHandler`) — consumido a partir da Fase 02, na conexão (`connect()`).

---

# 19. Riscos

`externalAccountId`/refresh token nunca são expostos em log ou resposta de API — `encryptedRefreshToken` (Fase 02, `ADR-0060`) nunca aparece em nenhum `toResponse()` de Controller, mesmo cifrado.

Sem constraint de unicidade em `externalAccountId` nesta versão — risco de duplicata; mitigação continua adiada (não implementada em `ADR-0060`).

`ADVERTISING_TOKEN_ENCRYPTION_KEY` ausente faz `connect()` real falhar ao cifrar o token (erro claro de `InfrastructureError`) — nunca salva token em texto puro como fallback.

---

# 20. Roadmap

Fase 01: `create()` + `POST`/`GET`. **Fase 02 (`ADR-0060`, esta missão)**: conexão OAuth real, `externalAccountId`/`encryptedRefreshToken` populados, as 5 transições de `connectionStatus`, `Ad Campaign`/`Ad Group`/`Keyword`/`Search Term`/`Sync Run` implementados, sincronização manual idempotente. Fase 03: `PerformanceSnapshot` consome os dados sincronizados para histórico. Fase 12: exposição em `screens.md`.

---

## Relação com Outros Módulos

- [BOM.md § 5B](../BOM.md) — entrada de catálogo correspondente
- [ADR-0059](../../../adr/ADR-0059-advertising-domain-and-advertising-account-object.md) — decisão de criar o Advertising Domain e esta especificação
- [ADR-0060](../../../adr/ADR-0060-performance-intelligence-fase-02-google-ads-integration.md) — Fase 02: conexão real, sincronização, objetos filhos
- [AdCampaign.md](AdCampaign.md), [AdGroup.md](AdGroup.md), [Keyword.md](Keyword.md), [SearchTerm.md](SearchTerm.md), [SyncRun.md](SyncRun.md) — objetos filhos implementados na Fase 02
- [specifications/performance-intelligence/](../../../specifications/performance-intelligence/database.md) — Product Layer que consome este objeto
- [OBJECT_SPECIFICATION_TEMPLATE.md](../OBJECT_SPECIFICATION_TEMPLATE.md) — template seguido

## Status

🚧 Parcial (v0.1.0) — capítulos 1-13 e 17-20 refletem Fase 01 + Fase 02 (`ADR-0060`); capítulos 14-16 `TODO`, sem fonte real ainda.
