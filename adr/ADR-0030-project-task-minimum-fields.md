# ADR-0030 — Project/Task: Campos Mínimos de Conteúdo (`Project.name`, `Task.title`, `Task.status`)

## Problema

`ADR-0026` confirmou a estrutura (`Task` como Internal Entity de `Project`), mas nem `BOM.md § Project` nem `BOM.md § Task` definem campos de conteúdo além do conceito — mesma classe de bloqueio já resolvida para `Party` (`ADR-0025`). Sem um campo mínimo de identificação, nem `Project` nem `Task` seriam exibíveis em nenhuma tela real.

## Contexto

- `BOM.md § Project`: "Projeto." — one-liner, sem campos.
- `BOM.md § Task`: "Tarefa operacional." — **mas com uma seção `Estados:` real, já confirmada**: `Pending`, `In Progress`, `Completed`, `Cancelled`. Diferente de `Party`, este objeto já tem uma evidência de conteúdo genuína no catálogo oficial — não precisa ser inferida nem inventada.
- `EVENT BUS` (`DOMAIN_MODEL.md § EVENT BUS`) lista os 10 eventos oficiais da plataforma — nenhum `TaskCreated`/`ProjectCreated`/`TaskCompleted` está entre eles. Mesma conclusão de `RELATIONSHIP_AGGREGATE_DESIGN.md § 7` para `Party`: nenhum Domain Event é inventado aqui para preencher essa lacuna.

## Decision Drivers

- Mesmo raciocínio de `ADR-0025`: um `Project`/`Task` sem nenhum campo de identificação textual não serve ao propósito documentado ("projetos, sprints, roadmap, backlog, kanban", `DOMAIN_MODEL.md § PROJECT DOMAIN`) — nenhuma tela de kanban poderia mostrar um `Task` sem título.
- `Task.status` **não precisa ser decidido aqui** — já está integralmente definido em `BOM.md`, com 4 valores explícitos. Usá-lo é aplicar evidência já existente, não inventar.

## Decision

- **`Project.name: string`** (obrigatório) — mesmo padrão de `Party.name` (`ADR-0025`).
- **`Task.title: string`** (obrigatório) — identificação mínima da tarefa.
- **`Task.status`**: união literal `"pending" | "in_progress" | "completed" | "cancelled"` — tradução direta dos 4 estados já nomeados em `BOM.md § Task`, sem inventar nenhum valor novo nem tabela de transição (a ordem/permissão de transição entre os 4 estados não está definida em nenhuma fonte — implementação inicial trata todas as transições como permitidas, mesma disciplina de "não inventar regra além do que a fonte já autoriza").

Nenhum outro campo (`description`, `dueDate`, `assignee`, `priority`) é adicionado — permanecem `Needs Evidence`, mesma disciplina de `Contact`/`Address` para `Party`.

## Rejected Alternatives

- Adicionar `description`/`dueDate`/`assignee` preventivamente — rejeitada, nenhuma fonte os define, mesmo critério de exclusão já usado em `ADR-0025`.
- Inventar uma tabela de transição de estados para `Task.status` — rejeitada, os 4 estados existem em `BOM.md`, mas a ordem/regras de transição entre eles não.

## Consequences

- `BOM.md § Project`/`§ Task` recebem nota de extensão não-destrutiva, citando esta ADR.
- Implementação de `Project`/`Task` pode prosseguir com `ADR-0026` (estrutura) + esta ADR (campos).

## Responsável

CTO / Arquiteto Chefe, decisão direta ("Project primeiro") em resposta a bloqueio reportado no início da implementação.

## Data

2026-07-23

## Impactos

- `knowledge/core/BOM.md § Project`/`§ Task` — nota de extensão não-destrutiva.
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum — nenhum código de `Project`/`Task` existe ainda.

## Status

Aceito
