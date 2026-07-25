# financial

## Objetivo

Domínio Financial — receitas, despesas, pagamentos, faturamento.

## Escopo

**Quarto domínio de negócio implementado de ponta a ponta (`ENG-0131`)**, seguindo a receita provada em Sales/Customer/Project: `Invoice` e `Subscription` (2 Aggregate Roots independentes, [ADR-0027](../../../adr/ADR-0027-financial-invoice-subscription-aggregates.md)) → Application → Infrastructure (Prisma real) → API (`apps/api`, `FinancialModule`) → Frontend (`apps/web`, `/financial`).

`Invoice.amount`/`currency`/`status`/`subscriptionId` e `Subscription.name` — campos mínimos via [ADR-0031](../../../adr/ADR-0031-financial-minimum-fields.md). Único Aggregate desta engenharia com Domain Event confirmado desde a primeira implementação: `InvoicePaid` (um dos 10 eventos oficiais, `DOMAIN_MODEL.md § EVENT BUS`), disparado por `Invoice.markPaid()`. `Payment` deliberadamente **não** implementado como objeto próprio — representado pela ação `markPaid()`. `Expense`/`Billing`/`Commission` permanecem bloqueados.

## Objetos Relacionados (BOM)

Invoice, Expense, Payment, Subscription — ver [UBIQUITOUS_LANGUAGE.md](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md).

> **Nota de Resolução (`ADR-0027`)**: a referência acima a "Subscription já em `services/kernel/organizations`" estava desatualizada — `Subscription` pertence a este domínio (Financial), decisão já formalizada por `ENG-0011` item 7 e confirmada em `DOMAIN_OWNERSHIP.md § 169`. `Invoice` e `Subscription` são dois Aggregate Roots independentes (`ADR-0027`), não um contendo o outro.

## Relação com Outros Módulos

- [services/kernel/](../../kernel/README.md) — infraestrutura consumida via [packages/contracts/](../../../packages/contracts/README.md)
- [adr/ADR-0006](../../../adr/ADR-0006-monorepo-structure-decision.md) — decisão de criar esta pasta
- [adr/ADR-0027](../../../adr/ADR-0027-financial-invoice-subscription-aggregates.md), [adr/ADR-0031](../../../adr/ADR-0031-financial-minimum-fields.md) — estrutura e campos mínimos

## Status

🟢 Domain/Application/Infrastructure/API/Frontend completos e testados contra Postgres real (Supabase). 14 testes unitários de Domain Layer, todos passando.
