# Performance Intelligence — Integrations

## Google Ads (plataforma inicial)

**Implementado na Fase 02** (`ADR-0060`) — `services/kernel/integration-hub/src/domain/ports/google-ads-provider.ts`:

```ts
export interface GoogleAdsProvider {
  createCampaign(name: string, budget: number): Promise<IntegrationResult>;
  testConnection(customerId: string, refreshToken: string): Promise<IntegrationResult<{ accountName?: string }>>;
  getCampaignPerformance(customerId: string, refreshToken: string, dateRange: GoogleAdsDateRange): Promise<IntegrationResult<GoogleAdsCampaignRow[]>>;
  getAdGroupsAndKeywordPerformance(customerId: string, refreshToken: string, dateRange: GoogleAdsDateRange): Promise<IntegrationResult<{ adGroups: GoogleAdsAdGroupRef[]; keywords: GoogleAdsKeywordRow[] }>>;
  getSearchTerms(customerId: string, refreshToken: string, dateRange: GoogleAdsDateRange): Promise<IntegrationResult<GoogleAdsSearchTermRow[]>>;
}
```

**Desvio da proposta original** deste arquivo: cada método recebe `refreshToken` (decifrado pela Application Layer a partir de `AdvertisingAccount.encryptedRefreshToken`) porque cada `AdvertisingAccount` tem sua própria credencial — diferente do padrão de token único global (`.env`) usado pelos outros 6 provedores de `integration-hub`. `getAccountDailySeries` **não foi implementado** — histórico diário é responsabilidade de `PerformanceSnapshot` (Analytics Domain, Fase 03), não de `Ad Campaign`/`Ad Group` (`ADR-0060`, Alternativas). `getKeywordPerformance` virou `getAdGroupsAndKeywordPerformance` — a query GAQL de `keyword_view` já retorna `ad_group.*` e `keyword.*` na mesma linha, então um único método popula `AdGroup` e `Keyword` sem duplicar a chamada.

Dois adapters existem: `ConsoleGoogleAdsProvider` (estrutural, `loggedOnly: true`, continua sendo o adapter **padrão** em `IntegrationHubModule`) e `HttpGoogleAdsProvider` (REST real contra `googleads.googleapis.com`, com refresh de access token via `oauth2.googleapis.com/token`, sem dependência npm nova — usa `fetch` nativo do Node 20+). `HttpGoogleAdsProvider` é testado com HTTP mockado, mas **nunca chamado contra a API real** neste ambiente — trocar o `useFactory` de `IntegrationHubModule` é o único passo restante quando a credencial permitir.

As 4 queries GAQL de referência (campanhas, série diária, keywords, termos de busca) do protótipo `Desktop/Winnet/google-ads-analyzer/data_source.py` foram reaproveitadas como base das 3 primeiras chamadas (adaptadas para incluir `campaign.id`/`ad_group.id`/`ad_group.name` — necessários para popular `Ad Campaign`/`Ad Group` como entidades, o que o protótipo não precisava fazer por só exibir os dados) — nunca o código Python nem seu fallback de dado simulado.

Credencial: a Winnet já tem developer token da Google Ads API solicitado (`Winnet_GoogleAds_API_Basic_Access_Application.pdf` no protótipo), hoje ainda em nível "Conta de Teste" — chamadas reais falhariam com `TEST_ACCOUNT`/`DEVELOPER_TOKEN_NOT_APPROVED`. Allbinox não tem nenhuma credencial ainda. **Bloqueio externo, não de código** — comunicado explicitamente ao usuário: a Fase 02 entrega arquitetura + código + testes unitários completos, mas não pode ser verificada end-to-end contra a API real neste ambiente.

## Gemini / IA (protótipo) → `ai-runtime` (Kernel, produção)

O protótipo usa Gemini diretamente (`gemini_engine.py`, modelo `gemini-2.5-flash`) com um `SYSTEM_PERSONA` de gestor de tráfego sênior — útil como referência de tom/estrutura de prompt, mas a implementação real deve passar pelo `ai-runtime` do Kernel (`ADR-0041`), que hoje tem o Port pronto mas nenhuma chamada real (`OPENAI_API_KEY`/`ANTHROPIC_API_KEY` vazias). Performance Intelligence seria o primeiro consumidor real do `ai-runtime`.

## Futuras plataformas de mídia paga

Meta Ads e outras — fora de escopo até Google Ads estar em produção para Winnet e Allbinox. O port `GoogleAdsProvider` estabelece o padrão (Port por plataforma) que uma futura `MetaAdsProvider` deve seguir.
