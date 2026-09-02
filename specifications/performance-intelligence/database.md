# Performance Intelligence — Database

> Schema real: `AdvertisingAccount` implementado e migration **aplicada** ao banco de produção (Fase 01). `AdCampaign`/`AdGroup`/`Keyword`/`SearchTerm`/`SyncRun` implementados na Fase 02 (`ADR-0060`), migration escrita, **não aplicada** — pendente de confirmação do usuário. Este arquivo é o mapeamento de objetos do master doc para os domínios/kernel do NOVARIS, corrigido por [ADR-0059](../../adr/ADR-0059-advertising-domain-and-advertising-account-object.md)/[ADR-0060](../../adr/ADR-0060-performance-intelligence-fase-02-google-ads-integration.md).

## Princípio

O master doc propõe uma hierarquia própria (`Organization → Company → Advertising Account → Campaign → Ad Group → Entity`). O NOVARIS já tem `Organization`/multi-tenancy em `services/kernel/organizations`. Um novo domínio, **Advertising** (`ADR-0059`, 11º Business Domain ativo), foi criado para os objetos que não têm dono em nenhum domínio existente — `Campaign` (`Marketing`) tem campos mínimos congelados por `ADR-0033`, incompatíveis com dado sincronizado de plataforma externa; a suposição inicial de reaproveitá-lo (`ADR-0058`) estava errada e foi corrigida.

## Mapeamento (corrigido por `ADR-0059`)

| Objeto do master doc | Domínio/Kernel dono | Situação hoje |
|---|---|---|
| `Organization` | `services/kernel/organizations` | Já existe. Reaproveitado diretamente. |
| `Company`, `Business Profile` | **Resolvido por eliminação** — não vira objeto novo | Winnet Metais e Allbinox Metais tornam-se, cada uma, sua própria `Organization` (tenant). `name`/`legalName`/`document`/`address` de `Organization` já cobrem o que `Business Profile` precisaria. |
| `Advertising Account` (conexão a plataforma de mídia paga) | **`services/domains/advertising`** (novo, `ADR-0059`) | **Implementado (Fase 01)** — Aggregate, Repository, `POST`/`GET /performance-intelligence/ad-accounts`. `connectionStatus` só chega a `NOT_CONNECTED` nesta fase; conexão OAuth real é Fase 02. Object Specification: [objects/AdvertisingAccount.md](../../knowledge/core/objects/AdvertisingAccount.md). |
| `Campaign` (interna de marketing, `ADR-0033`) | `services/domains/marketing` | Já existe, **não é reaproveitada** para representar campanhas do Google Ads — são conceitos diferentes. |
| `Ad Campaign` (sincronizada), `Ad Group`, `Keyword` | `services/domains/advertising` | **Implementados (Fase 02, `ADR-0060`)** — espelham o estado atual (config + últimos totais), upsert por natural key (idempotência). |
| `Search Term` | `services/domains/advertising` | **Implementado (Fase 02, `ADR-0060`)** — dado de performance por janela sincronizada (`BOM.md § 5B`), distinto de `Keyword`. |
| `Asset` | `services/domains/marketing` | Já existe (`ADR-0048`), sem relação com Advertising. |
| `PerformanceSnapshot` (métricas históricas por entidade/data) | `services/domains/analytics` | Não existe como código, mas o objeto `Snapshot` já está listado em `DOMAIN_MODEL.md § ANALYTICS DOMAIN`. Fase 03. |
| Detecção de anomalias/sinais (regra + estatística) | `services/domains/analytics` | Não existe. Fase 05. |
| Diagnóstico por IA (hipóteses, evidência) | `services/kernel/ai-runtime` | Port existe (`ADR-0041`), nenhuma chamada real a modelo de IA hoje. Fase 06. |
| `Recommendation` (ciclo de vida completo) | Fronteira em aberto: `services/domains/advertising` ou `services/domains/analytics` | Objeto novo — decisão adiada para quando a Fase 09 chegar, mesmo critério de `TODO` de fronteira já usado para `Revenue` (`PRODUCTS.md § NOVARIS CRM`). |
| `SyncRun` (rastreamento de sincronização) | `services/domains/advertising` | **Implementado (Fase 02, `ADR-0060`)** — sempre `INSERT`, uma linha por execução. |
| Pesquisa externa (registro de research) | `services/kernel/ai-runtime` ou `services/domains/analytics` | Não existe. Decisão em aberto, Fase 08. |
| Audit trail de ações executadas | `services/kernel/audit` | Já existe como Kernel Capability genérica — reaproveitada, não recriada. **Integração real implementada na Fase 02**: `ConnectAdvertisingAccountHandler` registra `AuditEntry` após `connect()` bem-sucedido. |

## O que fica para Fase 03 em diante

`PerformanceSnapshot` (histórico diário, Analytics Domain) consumindo `Ad Campaign`/`Ad Group`/`Keyword`/`Search Term` sincronizados; a decisão final de fronteira de `Recommendation` (Advertising vs. Analytics, Fase 09); aplicação da migration de Fase 02 ao banco (pendente de confirmação do usuário — ver `ADR-0060`); troca do `useFactory` de `GoogleAdsProvider` em `IntegrationHubModule` de `ConsoleGoogleAdsProvider` para `HttpGoogleAdsProvider` quando a credencial de Winnet for aprovada (Basic Access).
