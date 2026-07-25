# marketing

## Objetivo

Domínio Marketing — campanhas, ativos de marketing e canais de aquisição.

## Escopo

**Sexto domínio de negócio implementado de ponta a ponta (`ENG-0133`)**, seguindo a receita provada em Sales/Customer/Project/Financial/Activity: `Campaign` (Aggregate Root único, [MARKETING_AGGREGATE_DESIGN.md](../../../knowledge/architecture/analysis/MARKETING_AGGREGATE_DESIGN.md)) → Application → Infrastructure (Prisma real) → API (`apps/api`, `MarketingModule`) → Frontend (`apps/web`, `/marketing`).

Campos mínimos via [ADR-0033](../../../adr/ADR-0033-marketing-campaign-minimum-fields.md): `name` (obrigatório), `startDate`/`endDate` (opcionais — campanha em rascunho pode não ter datas fechadas ainda). Sem Domain Event, sem mutador — nenhuma fonte confirma estados ou transições. `Asset` **não** é resolvido por esta missão — sua posse (Marketing vs. conceito transversal) permanece bloqueada.

## Objetos Relacionados (BOM)

Campaign, Asset (Landing Page, Template, Content, Audience nomeados em DOMAIN_MODEL.md, mas não são objetos do BOM) — ver [UBIQUITOUS_LANGUAGE.md](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md).

## Relação com Outros Módulos

- [services/kernel/](../../kernel/README.md) — infraestrutura consumida via [packages/contracts/](../../../packages/contracts/README.md)
- [adr/ADR-0007](../../../adr/ADR-0007-domain-boundaries.md) — decisão de criar este bounded context e a distinção entre Product Layer e Domain Layer
- [adr/ADR-0033](../../../adr/ADR-0033-marketing-campaign-minimum-fields.md) — campos mínimos
- [knowledge/architecture/analysis/MARKETING_AGGREGATE_DESIGN.md](../../../knowledge/architecture/analysis/MARKETING_AGGREGATE_DESIGN.md) — Aggregate Design (`ENG-0132`)

## Status

🟢 Domain/Application/Infrastructure/API/Frontend completos e testados contra Postgres real (Supabase).
