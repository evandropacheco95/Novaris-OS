# projects

## Objetivo

Domínio Project — projetos, sprints, roadmap, backlog.

## Escopo

**Terceiro domínio de negócio implementado de ponta a ponta (`ENG-0129`/`0130`)**, seguindo a receita provada em Sales/Customer: `Project` (Aggregate Root) e `Task` (Internal Entity, [ADR-0026](../../../adr/ADR-0026-project-task-structure.md)) → Application → Infrastructure (Prisma real) → API (`apps/api`, `ProjectModule`) → Frontend (`apps/web`, `/projects`).

`Project.name`/`Task.title`/`Task.status` — campos mínimos via [ADR-0030](../../../adr/ADR-0030-project-task-minimum-fields.md), os 4 valores de `status` (`pending`/`in_progress`/`completed`/`cancelled`) já confirmados em `BOM.md`, nenhum inventado. `Epic`/`Story`/`Sprint`/`Milestone` permanecem bloqueados (sem entrada em `BOM.md`).

## Objetos Relacionados (BOM)

Project, Task, Sprint, Release — ver [UBIQUITOUS_LANGUAGE.md](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md).

## Relação com Outros Módulos

- [services/kernel/](../../kernel/README.md) — infraestrutura consumida via [packages/contracts/](../../../packages/contracts/README.md)
- [adr/ADR-0006](../../../adr/ADR-0006-monorepo-structure-decision.md) — decisão de criar esta pasta
- [adr/ADR-0026](../../../adr/ADR-0026-project-task-structure.md), [adr/ADR-0030](../../../adr/ADR-0030-project-task-minimum-fields.md) — estrutura e campos mínimos

## Status

🟢 Domain/Application/Infrastructure/API/Frontend completos e testados contra Postgres real (Supabase). 17 testes unitários de Domain Layer, todos passando.
