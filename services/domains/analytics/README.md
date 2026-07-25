# analytics

## Objetivo

Domínio Analytics — métricas, dashboards, relatórios e projeções.

## Escopo

**Sétimo e último domínio de negócio implementado de ponta a ponta (`ENG-0133`)**, seguindo a receita provada em Sales/Customer/Project/Financial/Activity/Marketing: `Dashboard` (Aggregate Root, [ANALYTICS_AGGREGATE_DESIGN.md](../../../knowledge/architecture/analysis/ANALYTICS_AGGREGATE_DESIGN.md)) → Application → Infrastructure (Prisma real) → API (`apps/api`, `AnalyticsModule`) → Frontend (`apps/web`, `/analytics`).

Campo mínimo via [ADR-0034](../../../adr/ADR-0034-analytics-dashboard-minimum-fields.md): `name` (obrigatório). Sem Domain Event, sem mutador confirmado do próprio Dashboard.

**`Widget` (`ADR-0049`, `ENG-0154`)**: desbloqueado — 4 tipos de visualização confirmados pelo CTO (`kpi`/`list`/`donut`/`bar`). Internal Entity de `Dashboard` (`type`/`title`/`metricKey`) — `metricKey` é uma string opaca que só o Frontend interpreta (contra dados já buscados de outros domínios), o Backend nunca a resolve, preservando o Analytics Domain desacoplado de Sales/Activity/etc.

## Objetos Relacionados (BOM)

Dashboard, Widget, Metric, Report, Forecast, Snapshot, Benchmark — ver [UBIQUITOUS_LANGUAGE.md](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md).

## Relação com Outros Módulos

- [services/kernel/](../../kernel/README.md) — infraestrutura consumida via [packages/contracts/](../../../packages/contracts/README.md)
- [adr/ADR-0007](../../../adr/ADR-0007-domain-boundaries.md) — decisão de criar este bounded context e a distinção entre Product Layer e Domain Layer
- [adr/ADR-0034](../../../adr/ADR-0034-analytics-dashboard-minimum-fields.md) — campo mínimo, `Widget` bloqueado
- [knowledge/architecture/analysis/ANALYTICS_AGGREGATE_DESIGN.md](../../../knowledge/architecture/analysis/ANALYTICS_AGGREGATE_DESIGN.md) — Aggregate Design (`ENG-0132`)

## Status

🟢 Domain/Application/Infrastructure/API/Frontend completos e testados contra Postgres real (Supabase), incluindo `Widget` (`ADR-0049`).
