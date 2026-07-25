# ADR-0026 — Project Domain: `Task` é Internal Entity, não Aggregate Root

## Problema

`AGGREGATE_DISCOVERY.md § 4` ("Itens Pendentes") registra explicitamente, desde `ENG-0012`, a pergunta "Confirmar se `Task` é Entity interna de `Project` ou Aggregate Root próprio" — nunca resolvida. Sem essa resposta, nenhuma implementação real do Project Domain pode começar (mesmo bloqueio estrutural que `Pipeline` representou para `Sales` antes de `ADR-0021`).

## Contexto

- `ADR-0016`/`ENG-0011` item 8 já confirmaram **posse** de `Task`: pertence ao Project Domain (não a `Activity`, apesar de citado em `DOMAIN_MODEL.md § ACTIVITY DOMAIN` também). Esta ADR não reabre essa decisão — resolve apenas a **estrutura** (Entity vs. Aggregate Root), pergunta distinta e ainda em aberto.
- `DOMAIN_MODEL.md § PROJECT DOMAIN`: objetos `Project`, `Epic`, `Story`, `Task`, `Sprint`, `Milestone`, `Release` — nenhum tem campo definido em `BOM.md` além de um one-liner para `Project`/`Sprint`/`Task`.
- `BACKLOG.md` já usa a hierarquia `Epic → Feature → Story → Task → Subtask` (nível de planejamento, `ADR-0017` já distinguiu esse `Task` do `Task` operacional do Project Domain) — mas a mesma forma de aninhamento (`Task` sempre subordinado a algo acima) se repete estruturalmente aqui.
- **Precedente decisivo direto**: `ADR-0021` já resolveu o mesmo tipo de pergunta para `Sales` (`Pipeline` vs. `Stage`), com o critério "é reutilizado por múltiplas instâncias do Aggregate pai, ou pertence exclusivamente a uma?". `Pipeline` é reutilizado por várias `Opportunity` ao longo do tempo → Aggregate Root. `Stage`/`Proposal` pertencem exclusivamente a um único `Pipeline`/`Opportunity` → Entity interna.
- Nenhuma fonte, em nenhum lugar, sugere que um `Task` seja compartilhado por mais de um `Project` simultaneamente — a leitura natural de "projetos, sprints, roadmap, backlog, kanban" (`DOMAIN_MODEL.md`) é de um `Task` pertencer a exatamente um `Project` (possivelmente através de `Sprint`/`Story`), nunca reaproveitado entre projetos diferentes.

## Decision Drivers

- Reaproveitar o critério já estabelecido e usado duas vezes nesta engenharia (`ADR-0021` para `Pipeline`/`Stage`; `RELATIONSHIP_AGGREGATE_DESIGN.md` para `Party`/`Relationship`) — não inventar um critério novo para o mesmo tipo de pergunta.
- Nenhuma evidência de reuso cross-`Project` de um `Task` — ausência de evidência a favor de Aggregate Root, presença implícita de evidência a favor de Entity (hierarquia `Epic→Story→Task` já usada em `BACKLOG.md`, mesmo que para outro `Task`).
- Manter `Project` como única porta de entrada transacional do domínio é consistente com "Fluxo configurável" ~ "negociação em andamento" já usado para justificar `Opportunity` como Aggregate Root único de `Sales`.

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. `Task` é Internal Entity de `Project`** | Mesmo padrão de `Proposal`/`Stage` — pertence a exatamente um `Project`, sem persistência ou identidade independente fora dele | Escolhida — nenhuma evidência de reuso cross-Aggregate, mesma forma estrutural de todo precedente já resolvido nesta engenharia |
| B. `Task` é Aggregate Root próprio | Permitiria referenciar um `Task` por id a partir de qualquer domínio (ex.: `Sales.Opportunity` referenciando `Task`, já citado como relacionamento candidato em `SALES_AGGREGATE_DESIGN.md`) | Rejeitada como estrutura *interna* do Project Domain — não impede que outros domínios referenciem `Task` por id (Entity interna ainda pode ter `id` público, mesmo padrão de `Proposal.id`); a preocupação de referência cross-domínio não exige que `Task` seja Aggregate Root, só que seu `id` seja estável e visível, o que uma Entity interna com Repository de leitura via `Project` já provê |

## Decision

**Opção A.** `Task` é **Internal Entity de `Project`** (o Aggregate Root) — mesmo padrão estrutural de `Proposal` (Sales) e `Stage` (Pipeline). Consequências estruturais:

- `Task` não tem `Repository` próprio — persiste exclusivamente como parte da coleção interna de `Project` (mesmo padrão de `Opportunity.proposals`/`Pipeline.stages`).
- `Epic`/`Story`/`Sprint`/`Milestone` permanecem **`Needs Evidence`** — nenhum tem campo ou forma definida em nenhuma fonte, e sua posição na árvore de composição (Task pertence a Story? A Sprint? A ambos?) não é resolvida por esta ADR, que trata exclusivamente da pergunta já registrada em `AGGREGATE_DISCOVERY.md § 4` (Task, não os demais).
- `Release` permanece fora do Project Domain — já resolvido por `ENG-0011` item 10 como Owner `Platform/Engineering` (ver `ADR-0029`, que reconcilia a listagem duplicada em `DOMAIN_MODEL.md`).

## Rejected Alternatives

Ver Opção B acima.

## Consequences

- `AGGREGATE_DISCOVERY.md § 4` — item "Confirmar se `Task` é Entity interna de `Project` ou Aggregate Root próprio" pode ser marcado resolvido, citando esta ADR.
- Uma futura implementação de `Project`/`Task` segue exatamente o precedente de `Opportunity`/`Proposal`: construtor privado, `create()`/`reconstitute()`, mutação só via método nomeado no Aggregate Root.
- `Epic`/`Story`/`Sprint`/`Milestone` continuam bloqueados — implementá-los exigiria uma nova ADR ou extensão de `BOM.md`, mesma disciplina de `ADR-0025` (Party).

## Responsável

CTO / Arquiteto Chefe — decisão explícita ("pode resolver as pendências"), aplicando o mesmo método já usado em `ADR-0021`/`RELATIONSHIP_AGGREGATE_DESIGN.md`.

## Data

2026-07-23

## Impactos

- `knowledge/architecture/decisions/AGGREGATE_DISCOVERY.md § 4` — nota de resolução não-destrutiva.
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum — nenhum código de `Project`/`Task` existe ainda. Esta ADR desbloqueia a primeira implementação futura.

## Status

Aceito
