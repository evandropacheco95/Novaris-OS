# ADR-0049: Widget — tipos de visualização e campos mínimos

## Status

Aceita.

## Contexto

`ADR-0034` deixou `Widget` (Internal Entity de `Dashboard`, Analytics Domain) deliberadamente bloqueado: "sem campos definidos... decisão de produto, não de arquitetura, que não deve ser antecipada sem necessidade" — adiado até um caso de uso de negócio real justificar quais tipos de visualização suportar.

Perguntado diretamente, o CTO confirmou: além do tipo mais simples (KPI numérico + lista), também quer gráficos (donut/barra) — desbloqueando `Widget` com 4 tipos de visualização.

## Decision Drivers

- Mesma disciplina de `ADR-0034`: só implementar o que tem evidência/decisão real — os 4 tipos vêm diretamente da escolha do CTO, nenhum inventado além disso.
- `Widget` não deve acoplar o Analytics Domain a nenhum outro Business Domain (Sales/Activity/etc.) para "saber" o que exibir — isso violaria a regra de dependência entre domínios (Analytics não pode depender de Sales/Activity para funcionar). Solução: `Widget` armazena só **configuração de exibição** (`type`/`title`/`metricKey`) — `metricKey` é uma string opaca que o **Frontend** interpreta para decidir quais dados já disponíveis (via os mesmos endpoints já usados no Dashboard principal, `ENG-0149`) alimentam aquele Widget. O Backend nunca valida ou resolve `metricKey` contra dado real de outro domínio.
- `donut`/`bar` reaproveitam o `StatusDonut` (`ENG-0149`) e uma nova visualização de barra simples — nenhuma biblioteca nova (Recharts já é dependência de `apps/web`).

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. `Widget` armazena só configuração de exibição (`type`/`title`/`metricKey`); Frontend resolve o dado real** | Mantém Analytics desacoplado de outros Business Domains; reaproveita dados já buscados no Dashboard principal | Escolhida |
| B. `Widget` referencia diretamente um domínio/métrica específica, validado pelo Backend | Exigiria Analytics conhecer Sales/Activity/etc., violando a regra de dependência entre Business Domains | Rejeitada |
| C. `Widget` guarda os dados em cache/snapshot próprio | Introduziria um mecanismo de sincronização/atualização não pedido, escopo muito maior que o necessário | Rejeitada |

## Decision

**Opção A.**

- `Widget` (Internal Entity de `Dashboard`): `type` (`"kpi" | "list" | "donut" | "bar"`), `title` (obrigatório), `metricKey` (string opaca, interpretada só pelo Frontend).
- `Dashboard` ganha `addWidget()` (mutador) e `getWidgets()` (coleção, mesmo padrão de `Campaign.addAsset()`/`getAssets()`).
- Sem Domain Event — nenhuma fonte confirma um, mesmo critério de `Campaign`/`Revenue`.
- Frontend (`/analytics`): cada `Widget` renderizado conforme seu `type`, usando os mesmos dados já buscados para o Dashboard principal (`Promise.all` de Opportunities/Leads/Parties/Activities/Projects/Invoices, `ENG-0149`) — nenhuma nova chamada de agregação no Backend.

## Consequences

- Nova tabela `widgets` (Internal Entity, mesmo padrão de `campaign_assets`/`quotation_line_items` — FK real para `dashboards` com `ON DELETE CASCADE`, RLS via join).
- `PrismaDashboardRepository.save()` passa a sincronizar `widgets` transacionalmente.
- `BOM.md § Dashboard` (nota já existe, `ADR-0034`) e `MARKETING`/`ANALYTICS_AGGREGATE_DESIGN.md` recebem nota de resolução não-destrutiva.
- Nenhuma Permission nova — `analytics.dashboards.manage` já cobre a nova rota (sub-ação de Dashboard, mesmo critério de `Asset`/`ADR-0048`).

## Responsável

CTO / Arquiteto Chefe — decisão explícita, confirmando "também gráficos (donut/barra)" entre as opções apresentadas.

## Data

2026-07-25

## Plano de Migração

Nenhum — objeto novo, sem dado existente para migrar.

## Status

Aceito
