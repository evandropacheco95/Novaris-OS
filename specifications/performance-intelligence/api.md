# Performance Intelligence — API

> Nenhuma rota existe hoje. Rascunho de superfície de API para quando a Fase 01+ for aprovada, seguindo o padrão já usado em `apps/api/src/marketing/campaign.controller.ts` (`JwtAuthGuard` + `PermissionGuard` + `organizationId` do token, nunca de query param — mesmo achado de isolamento reforçado documentado em `ADR-0057`/`PRODUCTS.md § NOVARIS CRM`).

## Conexão e sincronização

- `POST /performance-intelligence/ad-accounts` — conectar conta Google Ads a uma Company.
- `POST /performance-intelligence/ad-accounts/:id/test-connection`
- `POST /performance-intelligence/ad-accounts/:id/sync` — sincronização manual.
- `GET /performance-intelligence/ad-accounts/:id/sync-runs` — histórico de sincronização.

## Análise

- `GET /performance-intelligence/ad-accounts/:id/overview?range=` — nível Conta, com comparação de período.
- `GET /performance-intelligence/campaigns?ad_account_id=&range=` — nível Campanha.
- `GET /performance-intelligence/campaigns/:id/ad-groups`
- `GET /performance-intelligence/campaigns/:id/search-terms`

## Inteligência

- `GET /performance-intelligence/signals?ad_account_id=&severity=`
- `GET /performance-intelligence/signals/:id/diagnosis` — hipóteses estruturadas.
- `GET /performance-intelligence/recommendations?status=`
- `POST /performance-intelligence/recommendations/:id/approve`
- `POST /performance-intelligence/recommendations/:id/reject`
- `POST /performance-intelligence/recommendations/:id/execute` — só após `approve`, valida via Action Guardian.

## Medição

- `GET /performance-intelligence/actions/:id/measurement`

Todas as rotas são propostas e sujeitas a mudança quando a Fase 01 (Foundation) e Fase 02 (Google Ads Integration) forem implementadas de fato.
