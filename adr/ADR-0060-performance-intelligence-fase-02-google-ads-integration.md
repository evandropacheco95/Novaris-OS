# ADR-0060 - Performance Intelligence Fase 02: Google Ads Integration (objetos, port, credencial, sincronização)

## Problema

[ADR-0059](ADR-0059-advertising-domain-and-advertising-account-object.md) criou o Advertising Domain e implementou `AdvertisingAccount` (Fase 01), mas deixou 5 objetos catalogados sem Object Specification (`Ad Campaign`, `Ad Group`, `Keyword`, `Search Term`, `Sync Run` — bloqueados por `NOVARIS_CONSTITUTION.md Article V`) e nenhuma forma real de: (a) conectar uma `AdvertisingAccount` via OAuth de verdade, (b) armazenar um refresh token de forma que possa ser **usado de novo** (não só hasheado, como `credentials` — `ADR-0010` — que é unidirecional), (c) ler dados reais do Google Ads, (d) sincronizar sem duplicar dado a cada execução. `roadmap.md` Fase 02 exige resolver tudo isso antes de qualquer sincronização real acontecer.

## Contexto

- `NOVARIS_CONSTITUTION.md Article V` exige Object Specification antes de tabela/API/tela para cada um dos 5 objetos pendentes.
- `services/kernel/integration-hub` tem hoje 7 Ports, **todos** com adapter `Console*` (estrutural, `loggedOnly: true`) — nenhuma credencial real existe para nenhum provedor (`ADR-0040`). `GoogleAdsProvider` é um desses 7, hoje só com `createCampaign()`.
- `services/kernel/identity/.../credential-writer.ts` só sabe gravar hash bcrypt **unidirecional** (`ADR-0010`, senha de login) — não serve para um refresh token OAuth, que precisa ser **decifrado de novo** a cada chamada futura à API. Não existe no repositório nenhum padrão de segredo cifrado reversível.
- `BOM.md § 5B` já registra `Search Term` como **"dado de performance, não de configuração"** — distinto de `Keyword` (configuração). Isso significa que, ao contrário de `Ad Campaign`/`Ad Group`/`Keyword` (que espelham o estado atual da configuração externa e são upsertados), `Search Term` carrega métricas (cliques, impressões, custo) por natureza, e cada linha é o resultado de uma janela de datas de uma sincronização.
- `apps/api/src/organization/organization.module.ts` já estabeleceu o padrão real de integração com `kernel/audit`: `CreateAuditEntryHandler` injetado por construtor no Handler que executa a ação sensível, chamado depois do `save()` bem-sucedido, falha de auditoria nunca reverte a operação primária (`ADR-0035`).
- O protótipo Python (`Desktop/Winnet/google-ads-analyzer/data_source.py`) valida manualmente 4 queries GAQL reais (campanhas, série diária, keywords, termos de busca) — reaproveitadas aqui como referência de **quais campos existem na API**, nunca como código ou como fallback de dado simulado (proibido, princípio "nunca inventar dado" do master doc / `overview.md`).
- Nem Winnet (developer token em nível "Conta de Teste", não aprovado para Basic Access) nem Allbinox (nenhuma credencial) têm acesso funcional à API real hoje — confirmado nos arquivos do protótipo. Isso é um bloqueio externo, não uma decisão de arquitetura.

## Alternativas

| Decisão | Opção A | Opção B (escolhida) |
|---|---|---|
| Onde mora o histórico de métricas de `Ad Campaign`/`Ad Group`/`Keyword` | Cada objeto carrega sua própria série de métricas | Cada objeto guarda só o **estado atual** (config + últimos totais conhecidos); histórico populado por `PerformanceSnapshot` (Analytics Domain, Fase 03) — `getAccountDailySeries` fica **deferida para a Fase 03**, não implementada nesta ADR |
| `Search Term` | Tratar como config (upsert por texto, sem métricas) | Tratar como dado de performance por sync (`BOM.md § 5B` já define isso) — cada `SyncRun` gera novas linhas para a janela de datas sincronizada |
| Armazenamento do refresh token | Reaproveitar `credentials`/`credential-writer.ts` (hash bcrypt) | Rejeitada — hash é unidirecional, token precisa ser usado de novo. Nova coluna `encryptedRefreshToken` (AES-256-GCM, chave em `ADVERTISING_TOKEN_ENCRYPTION_KEY`), decifrado só na Infrastructure Layer, nunca no Domain |
| Adapter real do Google Ads | Adicionar `google-ads-api` (pacote npm, wrapper gRPC) | REST direto (`googleads.googleapis.com/v17/customers/{id}/googleAds:search`) via `fetch` nativo (Node 20+) — sem dependência nova, mesmo critério já usado em `packages/database/src/index.ts` (`process.loadEnvFile` nativo em vez de `dotenv`) |
| `HttpGoogleAdsProvider` como adapter padrão de `IntegrationHubModule` | Trocar `ConsoleGoogleAdsProvider` por `HttpGoogleAdsProvider` como default | Rejeitada por ora — nenhuma credencial funcional existe (Winnet ainda "Conta de Teste"); trocar o `useFactory` para um adapter que nunca foi validado contra a API real romperia a disciplina do próprio `ADR-0040` ("nenhum adapter Console é trocado sem credencial real que permita verificar"). `HttpGoogleAdsProvider` é implementado, testado com HTTP mockado, e disponível — a troca do `useFactory` em `IntegrationHubModule` é o único passo restante quando o token de Winnet for aprovado para Basic Access |

## Escolha

1. **5 Object Specifications escritas** (`knowledge/core/objects/{AdCampaign,AdGroup,Keyword,SearchTerm,SyncRun}.md`), desbloqueando `Article V`. `BOM.md § 5B` atualizado de "Proposto" para implementado.

2. **`AdvertisingAccount` ganha transições reais de estado** (`connect()`, `requestSync()`, `startSync()`, `completeSync()`, `failSync()`), cada uma validando a transição a partir do estado atual (`ConflictError` se inválida, mesmo padrão de `Opportunity.markWon()`), e 3 Domain Events: `AdvertisingAccountConnected`, `AdvertisingAccountSyncCompleted`, `AdvertisingAccountSyncFailed`. `requestSync()`/`startSync()` não disparam evento próprio — nenhuma fonte confirma consumidor para eles (mesmo critério de `Opportunity.advanceStage()`, sem evento).

3. **Novo campo `encryptedRefreshToken?: string`** em `AdvertisingAccountProps` — nunca decifrado dentro do Aggregate (Domain Layer não faz I/O). Cifra/decifra vive em `services/domains/advertising/infrastructure/security/token-cipher.ts` (AES-256-GCM, IV aleatório por operação, chave de `ADVERTISING_TOKEN_ENCRYPTION_KEY`, formato `base64(iv):base64(authTag):base64(ciphertext)`).

4. **4 novos Aggregates** no Advertising Domain, mesma estrutura DDD de `AdvertisingAccount`:
   - `AdCampaign` — espelha o estado *atual* de uma campanha externa (`externalCampaignId`, `name`, `status`, `channelType`, mais últimos totais conhecidos de custo/cliques/impressões/conversões — não histórico). Upsert por `(advertisingAccountId, externalCampaignId)`.
   - `AdGroup` — espelha um grupo de anúncios (`externalAdGroupId`, `name`, `status`, referência a `AdCampaign`). Upsert por `(advertisingAccountId, externalAdGroupId)`.
   - `Keyword` — espelha uma palavra-chave configurada (`externalCriterionId`, `text`, `matchType`, `qualityScore?`, referência a `AdGroup`, últimos totais conhecidos). Upsert por `(advertisingAccountId, externalCriterionId)`.
   - `SyncRun` — rastreia uma execução de sincronização (`status`: `RUNNING → SUCCEEDED | FAILED`, contadores de itens sincronizados, `startedAt`/`finishedAt`/`errorMessage?`). Sempre `INSERT`, nunca upsert — cada execução é um fato novo, imutável após concluída.
   - `SearchTerm` — **distinto dos demais**: carrega métricas próprias (`clicks`, `impressions`, `conversions`, `costMicros`) e uma janela de datas (`dateRangeStart`/`dateRangeEnd`), referenciando o `SyncRun` que o produziu. Upsert por `(advertisingAccountId, adGroupId, searchTerm, dateRangeStart, dateRangeEnd)` — mesma janela sincronizada de novo substitui os totais anteriores (nunca soma, para não inflar métrica).
   
   Todos os 5 (incluindo `AdvertisingAccount`) seguem `AGGREGATE_IMPLEMENTATION_STANDARD.md` (ENS-0001): `create()`/`reconstitute()`, `Result<T, DomainError>`, `organizationId` em todo Props, sem exceção lançada.

5. **`GoogleAdsProvider` (port) estendido** com 4 métodos novos — só o que a Fase 02 usa (`getAccountDailySeries` fica para a Fase 03, junto de `PerformanceSnapshot`, por não ter dono ainda no Advertising Domain — histórico de métricas não é responsabilidade de `Ad Campaign`/`Ad Group`, conforme Alternativas acima):
   ```ts
   testConnection(customerId, refreshToken): Promise<IntegrationResult<{ accountName?: string }>>
   getCampaignPerformance(customerId, refreshToken, dateRange): Promise<IntegrationResult<GoogleAdsCampaignRow[]>>
   getAdGroupsAndKeywordPerformance(customerId, refreshToken, dateRange): Promise<IntegrationResult<{ adGroups: GoogleAdsAdGroupRef[]; keywords: GoogleAdsKeywordRow[] }>>
   getSearchTerms(customerId, refreshToken, dateRange): Promise<IntegrationResult<GoogleAdsSearchTermRow[]>>
   ```
   **Desvio de `integrations.md`** (que propunha só `customerId`): cada `AdvertisingAccount` tem seu próprio refresh token (não um único token global, diferente do padrão hoje usado pelos outros 6 provedores de `integration-hub`, que assumem uma única credencial global via `.env`) — o Port precisa do token por chamada, o Handler é quem decifra e passa. `getAdGroupsAndKeywordPerformance` funde os dois porque a query GAQL de `keyword_view` já retorna ambos (`ad_group.*` e `ad_group_criterion.keyword.*` na mesma linha) — separar em duas chamadas duplicaria a mesma query GAQL sem necessidade.

6. **`ConsoleGoogleAdsProvider` estendido** com os mesmos 4 métodos (retornam `{ success: true, loggedOnly: true, ... }` com listas vazias — nunca dado simulado). **`HttpGoogleAdsProvider` (novo)** implementa os 5 métodos (+ `createCampaign`) contra a REST API real do Google Ads (`googleads.googleapis.com`), com refresh de access token via `oauth2.googleapis.com/token`. **Não é o adapter padrão** de `IntegrationHubModule` ainda (ver Alternativas) — fica disponível, testado com HTTP mockado (`node:test` + stub de `fetch`), pronto para troca de `useFactory` quando a credencial de Winnet for aprovada.

7. **Fluxo OAuth**: `GET /performance-intelligence/ad-accounts/:id/oauth/start` (retorna URL de consentimento do Google, `state` assinado com HMAC contendo `accountId`+`organizationId`+expiração, para CSRF/IDOR) e `GET /performance-intelligence/ad-accounts/oauth/callback` (troca `code` por tokens, cifra o refresh token, chama `account.connect()`, salva, registra `AuditEntry` via `CreateAuditEntryHandler`, mesmo padrão de `UpdateOrganizationProfileHandler`). `POST /performance-intelligence/ad-accounts/:id/sync` dispara sincronização manual (`SyncAdvertisingAccountHandler`): `startSync()` → chama os 3 métodos de leitura do `GoogleAdsProvider` → upserta `AdCampaign`/`AdGroup`/`Keyword`/`SearchTerm` → cria/atualiza `SyncRun` → `completeSync()` ou `failSync()`.

8. **Migration Prisma escrita, não aplicada** (mesmo critério do `ADR-0059`) — requer confirmação explícita do usuário antes de rodar contra o Supabase de produção.

## Consequências

- Advertising Domain passa a ter 6 objetos implementados (`AdvertisingAccount` + 5 novos) — nenhum mais bloqueado por `Article V`.
- Sincronização é **idempotente por natural key** (upsert), nunca duplica linha ao rodar de novo a mesma janela — atende exigência explícita de `roadmap.md` Fase 02.
- `PerformanceSnapshot`/histórico diário (`getAccountDailySeries`) continua **não implementado** — dependência explícita da Fase 03 (Analytics Domain), não um esquecimento.
- `Recommendation`/diagnóstico de IA continuam fora de escopo (Fases 06-09) — `SearchTerm` guarda métrica bruta, não interpretação.
- **Sincronização real com a API do Google Ads não pode ser verificada neste ambiente** — Winnet ainda em nível "Conta de Teste" (não aprovado para Basic Access), Allbinox sem credencial nenhuma. O código é escrito e testado (unitário, com HTTP mockado) mas **não executado contra a API real**. Isso é uma limitação externa, comunicada explicitamente ao usuário, não uma falha de implementação.
- `ADVERTISING_TOKEN_ENCRYPTION_KEY` torna-se uma dependência de produção nova — sem ela, `connect()` real falha ao cifrar (erro claro de `InfrastructureError`, nunca salva token em texto puro).

## Responsável

Decisão de arquitetura direta (Claude Code / Principal Engineer), continuando a Fase 02 sob instrução explícita do usuário ("faça a fase 2"), aplicando os mesmos padrões já estabelecidos em `ADR-0059` e `AGGREGATE_IMPLEMENTATION_STANDARD.md`.

## Data

2026-09-01

## Impactos

- `novaris/knowledge/core/objects/{AdCampaign,AdGroup,Keyword,SearchTerm,SyncRun}.md` (novos) — Object Specifications completas.
- `novaris/knowledge/core/BOM.md` — § 5B atualizada (5 objetos de "Proposto" para implementado).
- `novaris/knowledge/core/objects/README.md` — 5 novas linhas.
- `novaris/specifications/performance-intelligence/{database,integrations,permissions,roadmap}.md` — atualizados para refletir esta ADR.
- `novaris/services/domains/advertising/` — 4 novos Aggregates, Repositories, Application Layer (`Connect`/`SyncAdvertisingAccount`), Infrastructure (mappers, repositories Prisma, `token-cipher.ts`), testes.
- `novaris/services/kernel/integration-hub/` — Port estendido, `ConsoleGoogleAdsProvider` estendido, `HttpGoogleAdsProvider` novo + testes.
- `novaris/packages/database/prisma/schema.prisma` — coluna nova em `AdvertisingAccount` + 5 novos models.
- `novaris/packages/database/prisma/migrations/<timestamp>_advertising_fase02/` (nova, **não aplicada**).
- `novaris/apps/api/src/advertising/` — Controller com endpoints OAuth + sync; Module com wiring novo (inclui `GoogleAdsProvider` de `IntegrationHubModule` e `CreateAuditEntryHandler` de `AuditModule`).
- `novaris/.env.example` — novas variáveis: `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_OAUTH_CLIENT_ID`, `GOOGLE_ADS_OAUTH_CLIENT_SECRET`, `GOOGLE_ADS_OAUTH_REDIRECT_URI`, `ADVERTISING_TOKEN_ENCRYPTION_KEY`, `ADVERTISING_STATE_SIGNING_SECRET`.

## Plano de Migração

Nenhum dado existente é afetado — todas as tabelas novas, mais uma coluna nullable (`encrypted_refresh_token`) em `advertising_accounts` (já vazia hoje, nenhuma conta conectada existe). Migration escrita seguindo a convenção de nome, **não aplicada** ao banco de produção — requer confirmação explícita do usuário, mesmo critério do `ADR-0059`.

## Status

Aceito
