# ADR-0045 — CalendarEvent, Reminder e Checklist: Campos Mínimos (Activity Domain)

## Problema

`ACTIVITY_AGGREGATE_DESIGN.md § 8` já havia identificado `Calendar Event`, `Reminder` e `Checklist` como nomeados em `DOMAIN_MODEL.md § ACTIVITY DOMAIN`, mas **sem nenhuma entrada em `BOM.md`** — "bloqueados até extensão de `BOM.md`" (§ 9, achado #4). Esta ADR resolve esse bloqueio, continuando o arco de adaptação do Salesforce (`ADR-0042`–`0044`) por instrução direta do CTO de prosseguir sem pausar.

## Contexto

- Verificado por busca direta: nenhum dos 3 tem entrada em `BOM.md` (confirmado também por `ACTIVITY_AGGREGATE_DESIGN.md § 1`, linha "sem entrada em BOM.md, confirmado por busca direta").
- `Timeline` (mesmo grupo de objetos) já resolvido como projeção de leitura não-persistente (`ACTIVITY_AGGREGATE_DESIGN.md § 3`) — fora do escopo desta ADR.
- `Comment`/`Case` (mesmo domínio) já resolvidos em `ADR-0043`.
- Precedente de campo mínimo já usado 6+ vezes nesta sessão (`ADR-0025`, `ADR-0030`, `ADR-0031`, `ADR-0032`, `ADR-0033`, `ADR-0034`): só os campos estruturalmente necessários, nenhum evento sem confirmação explícita de fonte.
- Salesforce real: `Event` (calendário, `StartDateTime`/`EndDateTime`/`Location`), `Reminder` (associado a Task/Event, `RemindAt`, `IsDismissed`), Checklist não existe como objeto nativo do Salesforce core (é conceito de produtividade genérico, adaptado aqui sem equivalente 1:1).

## Decision Drivers

- Mesma disciplina de campo mínimo de toda a sessão.
- Nenhum dos 3 tem `Eventos:` confirmados em nenhuma fonte (diferente de `Activity`, que tem `ActivityCreated`/`ActivityCompleted` documentados) — logo, **nenhum Domain Event é criado** para os 3, mesmo critério já aplicado a `Party`/`Product`/`Campaign`/`Dashboard`.
- Todos os 3 referenciam `Party` por id — mesmo padrão já confirmado para `Activity`/`Case` neste domínio.

## Alternativas

Nenhuma alternativa de posicionamento de domínio é necessária — os 3 já têm Owner confirmado (`ACTIVITY DOMAIN`, `DOMAIN_MODEL.md`). A única decisão é a forma mínima de cada um.

## Decision

- **`CalendarEvent`** (Aggregate Root): `organizationId`, `partyId` (obrigatório), `subject` (obrigatório), `startAt`/`endAt` (obrigatórios, `DateTime`), `location?`. Sem status/lifecycle além de `reschedule(startAt, endAt)` — cancelamento é `delete()` (hard delete, mesma convenção majoritária do pacote), não um estado `"cancelled"` inventado. Sem recorrência (RRULE) — complexidade de escala empresarial sem evidência de necessidade.
- **`Reminder`** (Aggregate Root): `organizationId`, `partyId` (obrigatório), `message` (obrigatório), `remindAt` (obrigatório, `DateTime`), `dismissed` (booleano, padrão `false`). `dismiss()`: `false → true`, terminal (`ConflictError` se já dispensado).
- **`Checklist`** (Aggregate Root) + **`ChecklistItem`** (Internal Entity, mesmo padrão de `Proposal`/`Stage`/`QuotationLineItem`): `Checklist` tem `organizationId`, `partyId` (obrigatório), `title` (obrigatório), coleção `items: ChecklistItem[]`. `ChecklistItem` tem `label` (obrigatório), `completed` (booleano, padrão `false`). `addItem(label)`, `toggleItem(itemId)` (alterna `completed`).
- **Nenhum Domain Event** para os 3 — sem confirmação de fonte (diferente de `Activity`).

## Rejected Alternatives

Nenhuma — posicionamento de domínio já resolvido, única decisão era campo mínimo.

## Consequences

- `services/domains/activity`: 3 novos Aggregates Roots (`CalendarEvent`, `Reminder`, `Checklist` + `ChecklistItem`), sem nova dependência de pacote.
- 4 novas tabelas Postgres (`calendar_events`, `reminders`, `checklists`, `checklist_items`).
- API real: `/calendar-events`, `/reminders`, `/checklists` (+ item add/toggle).
- Frontend: `/calendar-events`, `/reminders`, `/checklists`.
- **Fecha 100% dos objetos oficiais do Activity Domain** (`Activity`, `Task` — por referência, `Timeline` — projeção, `Comment`, `Case`, `CalendarEvent`, `Reminder`, `Checklist` — todos com posição resolvida).

## Responsável

CTO / Arquiteto Chefe — "pode continuar com o arco Salesforce", continuando o próximo gap já identificado por `ACTIVITY_AGGREGATE_DESIGN.md § 9`.

## Data

2026-07-24

## Impactos

- `services/domains/activity/domain/aggregates/{calendar-event,reminder,checklist}/**`, `domain/entities/checklist-item/**`, `domain/repositories/{calendar-event,reminder,checklist}-repository.ts`.
- `services/domains/activity/application/{commands,handlers}/**` (9 novos casos de uso).
- `services/domains/activity/infrastructure/{mappers,repositories}/*{calendar-event,reminder,checklist}*`.
- `packages/database/prisma/schema.prisma` — 4 novos models + migration.
- `apps/api/src/activity/{calendar-event,reminder,checklist}.controller.ts`, atualização de `activity.module.ts`.
- `apps/web/app/{calendar-events,reminders,checklists}/page.tsx` (novos).
- `apps/api/src/seed.ts` — novos códigos de Permission.
- `knowledge/architecture/analysis/ACTIVITY_AGGREGATE_DESIGN.md` — nota de resolução do achado #4 (§ 9).

## Plano de Migração

Nenhum dado existente é migrado — 4 tabelas novas, vazias. Aditivo.

## Status

Aceito
