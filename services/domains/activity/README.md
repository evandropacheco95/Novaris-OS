# activity

## Objetivo

Domínio Activity — registro de interações (ligação, WhatsApp, e-mail, reunião, visita, nota) com um Party.

## Escopo

**Quinto domínio de negócio implementado de ponta a ponta (`ENG-0133`)**, seguindo a receita provada em Sales/Customer/Project/Financial: `Activity` (Aggregate Root único, [ACTIVITY_AGGREGATE_DESIGN.md](../../../knowledge/architecture/analysis/ACTIVITY_AGGREGATE_DESIGN.md)) → Application → Infrastructure (Prisma real) → API (`apps/api`, `ActivityModule`) → Frontend (`apps/web`, `/activity`).

Campos mínimos via [ADR-0032](../../../adr/ADR-0032-activity-minimum-fields.md): `partyId` (obrigatório), `type` (6 valores já confirmados em `BOM.md`), `status` (`"open" | "completed"`, derivado dos eventos `ActivityCreated`/`ActivityCompleted`, ambos já confirmados e implementados), `notes` (opcional). `Timeline` não é implementado (confirmado não-persistente, projeção de leitura).

**`Case` + `Comment` (`ADR-0043`, `ENG-0144`)**: 2 novos Aggregates Roots, adaptados do Salesforce (Service Cloud / Chatter), por autorização direta do CTO. `Case` — registro de atendimento a um Party, ciclo `new → in_progress → closed` (`CaseCreated`/`CaseClosed`). `Comment` — deliberadamente polimórfico (`targetType` livre, sem enum fechado, `BOM.md § Comment`), primeira implementação real desde a modelagem original (`DOMAIN_MODEL.md`); a nota anterior deste README ("Comment... fora de escopo") está **corrigida** — `ENG-0132` confirmara o Owner de domínio, `ENG-0144` implementa.

**`CalendarEvent` + `Reminder` + `Checklist` (`ADR-0045`, `ENG-0146`)**: últimos 3 objetos oficiais deste domínio, antes bloqueados por falta de entrada em `BOM.md` (`ACTIVITY_AGGREGATE_DESIGN.md § 7`/`§ 9`, achado #4). Campos mínimos definidos pela própria `ADR-0045`. Nenhum dos 3 tem Domain Event — nenhuma fonte confirma um. **Fecha 100% dos objetos oficiais do Activity Domain.**

## Objetos Relacionados (BOM)

Activity — ver [UBIQUITOUS_LANGUAGE.md](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md).

## Relação com Outros Módulos

- [services/kernel/](../../kernel/README.md) — infraestrutura consumida via [packages/contracts/](../../../packages/contracts/README.md)
- [adr/ADR-0032](../../../adr/ADR-0032-activity-minimum-fields.md) — campos mínimos
- [knowledge/architecture/analysis/ACTIVITY_AGGREGATE_DESIGN.md](../../../knowledge/architecture/analysis/ACTIVITY_AGGREGATE_DESIGN.md) — Aggregate Design (`ENG-0132`)

## Status

🟢 Domain/Application/Infrastructure/API/Frontend completos e testados contra Postgres real (Supabase) — `Activity` (`ENG-0133`), `Case`/`Comment` (`ADR-0043`, `ENG-0144`), `CalendarEvent`/`Reminder`/`Checklist` (`ADR-0045`, `ENG-0146`). **100% dos objetos oficiais do domínio resolvidos.**
