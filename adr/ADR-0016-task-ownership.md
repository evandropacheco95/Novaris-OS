# ADR-0016 — Task Ownership: Confirmed Project Domain, Consumed by Reference

## Context

`DOMAIN_MODEL.md` lista `Task` nos "Objetos" de **dois** domínios simultaneamente — `ACTIVITY DOMAIN` e `PROJECT DOMAIN` — uma das duas únicas violações da própria regra do documento já registradas desde sua versão original ("Todo objeto pertence a exatamente um domínio"). `ENG-0011` (decisão formal do CTO, item 8) já resolveu isso em prosa: **"`Task` pertence ao domínio `Projects`."** — decisão nunca contradita ou invalidada por nenhuma missão desde então (diferente de `Queue`, cuja atribuição a "CRM" foi invalidada por `ADR-0011` porque "CRM" provou não ser um domínio válido; `Projects` é, e sempre foi, um domínio real e não-controverso — não há base para invalidar essa decisão pelo mesmo mecanismo).

Esta missão pede uma Discovery formal, com evidência própria, que confirme (ou não) essa decisão — mesmo padrão já aplicado a `Queue` (`ADR-0012`), `Automation` (`ADR-0013`), `AI` (`ADR-0014`) e `Knowledge` (`ADR-0015`).

## Problem Statement

A decisão do CTO (`Task` → `Projects`) está em tensão direta com um sinal textual forte: `DOMAIN_MODEL.md § ACTIVITY DOMAIN`, seção "Responsável por", lista **"Tarefas"** como uma das 6 responsabilidades explícitas do domínio (`Agenda`, `Atividades`, `Tarefas`, `Calendário`, `Follow-up`, `Timeline`) — o mesmo tipo de sinal que foi **decisivo** para atribuir `Queue` a `Automation` em `ADR-0012` (cuja seção "Responsável por" citava "Filas"). Se o mesmo critério fosse aplicado sem qualificação, apontaria para `Activity`, não `Projects`.

**Pergunta a decidir**: `Task` deve ser (A) de `Activity`; (B) de `Projects`, confirmando `ENG-0011` item 8; (C) uma Platform Capability compartilhada; ou (D) dividido em conceitos distintos por Bounded Context?

## Evidence

| Critério | Achado | Fonte |
|---|---|---|
| **Decisão prévia do CTO, nunca invalidada** | `Task` pertence a `Projects` (`ENG-0011` item 8) — diferente de `Queue`/`CRM`, a premissa desta decisão (`Projects` é domínio real) nunca foi contestada por nenhuma ADR subsequente | `CONTEXT_RELATIONSHIPS.md § Decisão Formal do CTO`, item 8 |
| **Sinal textual "Responsável por"** | `ACTIVITY DOMAIN` cita "Tarefas" explicitamente; `PROJECT DOMAIN` não cita "Tarefas"/Task em seu "Responsável por" (`Projetos`, `Sprint`, `Roadmap`, `Backlog`, `Kanban`), só na lista de "Objetos" | `DOMAIN_MODEL.md §§ ACTIVITY DOMAIN, PROJECT DOMAIN` |
| **Distinção conceitual já definida** | `UBIQUITOUS_LANGUAGE.md § Domínio: Activity` já distingue explicitamente `Activity` de `Task`: **"Não usar como sinônimo de `Task` (`Activity` é registro passado, `Task` é trabalho pendente)"** — são conceitos relacionados mas estruturalmente diferentes (interação já ocorrida vs. trabalho pendente atribuído) | `UBIQUITOUS_LANGUAGE.md § Domínio: Activity` |
| **Resolução de referência já registrada, nunca formalizada em ADR** | `DOMAIN_OWNERSHIP.md § 3, seção Activity`: **"`Task` — Entidade — Owner definitivo é Projects; Activity, se referenciar `Task`, faz por id"** — o padrão de resolução (Owner único + referência por id de outros contextos) já estava escrito desde `ENG-0012`, nunca elevado a ADR nem propagado a `DOMAIN_MODEL.md` | `DOMAIN_OWNERSHIP.md § 3` |
| **Definição funcional (BOM.md)** | "Tarefa operacional" — trabalho pendente atribuído a um `User`, estados `Pending`/`In Progress`/`Completed`/`Cancelled` (`UBIQUITOUS_LANGUAGE.md`) — descreve um item de trabalho atribuível, consistente com o vocabulário de execução de `Project`/`Sprint`/`Backlog`, não com o vocabulário de "registro de interação" de `Activity` | `BOM.md`, `UBIQUITOUS_LANGUAGE.md` |
| **Uso transversal citado pela missão** (Sales, Follow-ups, AI) | `UBIQUITOUS_LANGUAGE.md § Sales`: `Opportunity` lista `Tasks` entre seus "Objetos Relacionados" — relação, não posse. Nenhuma fonte atribui `Task` como Entity própria de `Sales` ou como conceito da camada de IA (`ADR-0014`) — consistente com "referenciado por id por qualquer domínio", não com "múltiplos Owners" | `UBIQUITOUS_LANGUAGE.md § Domínio: Sales` |
| **Aggregate — pergunta estrutural distinta, ainda aberta** | `AGGREGATE_DISCOVERY.md § Projects`: `Task` é "candidato razoável a Entity interna de `Project` **ou** Aggregate Root próprio — não determinável sem Discovery"; "Fronteira transacional: `Aggregate Pending Discovery`" — pergunta de modelagem tática, distinta da pergunta de Ownership de domínio (já resolvida) | `AGGREGATE_DISCOVERY.md § 3` |
| **Terceiro conceito "Task", não relacionado, já registrado como sobreposição não resolvida** | `UBIQUITOUS_LANGUAGE.md § Domínio: Activity`, nota de "Quando Não Utilizar" do próprio `Task`: **"Não usar para o nível `Task` da hierarquia de backlog `Epic→Feature→Story→Task→Subtask` de `BACKLOG.md` sem checar se é o mesmo conceito"** — `BACKLOG.md` é o modelo de planejamento de **produto** (o quê construir), distinto do `Task` de execução de projeto tratado aqui. Sobreposição de nome já registrada, nunca resolvida — **fora do escopo desta ADR** | `UBIQUITOUS_LANGUAGE.md`, `knowledge/core/BACKLOG.md` |

## Options

### Option A — Task belongs to Activity Domain

**Rejeitada, apesar do sinal textual "Responsável por".** Contradiria diretamente `ENG-0011` item 8, uma decisão formal do CTO cuja premissa (`Projects` é domínio real) nunca foi invalidada — diferente do caso `Queue`/`CRM`, onde a reversão foi justificada por uma invalidação estrutural (`ADR-0011`), não por uma nova leitura de evidência textual concorrente. Reverter aqui exigiria autoridade que esta missão não tem: inventar uma nova decisão de domínio contra uma decisão explícita do CTO ainda válida.

### Option B — Task belongs to Project Domain

**Escolhida.** Reafirma `ENG-0011` item 8 com evidência própria: `Task` como "trabalho pendente atribuído a um User" (BOM.md/UBIQUITOUS_LANGUAGE.md) é consistente com o vocabulário de execução de projeto (`Sprint`, `Backlog`, `Kanban`); `UBIQUITOUS_LANGUAGE.md` já distingue `Task` de `Activity` como conceitos relacionados, não idênticos; `DOMAIN_OWNERSHIP.md` já registrava a solução de referência (Activity consome `Task` por id) desde `ENG-0012`, nunca formalizada — esta ADR formaliza exatamente essa solução, já correta, sem inventar nada novo.

### Option C — Task is a shared Platform Capability

**Rejeitada.** `Task` tem identidade de negócio, estado (`Pending`/`In Progress`/`Completed`/`Cancelled`) e atribuição a um `User` — características de um conceito de Domain Layer, não de uma capacidade técnica transversal como `Event Bus`/`Automation`/`AI`. Nenhuma fonte sugere `Task` como capacidade de infraestrutura.

### Option D — Task requires separation into different concepts

**Considerada com cuidado, parcialmente correta, mas não da forma que a duplicação em `DOMAIN_MODEL.md` sugere.** Não há evidência de que `Activity` precise de seu **próprio** Entity `Task` distinto do de `Projects` — `UBIQUITOUS_LANGUAGE.md` já resolve isso como referência por id, não como dois Entities paralelos. A separação real e genuína já existe, mas em outro lugar: entre o `Task` de execução de projeto (tratado por esta ADR) e o `Task` da hierarquia de planejamento de produto `Epic→Feature→Story→Task→Subtask` de `BACKLOG.md` — uma sobreposição de nome já registrada, não inventada por esta ADR, e que **não é resolvida aqui** (exigiria sua própria Discovery, fora do escopo desta missão, que trata da duplicação `Activity`/`Project` especificamente citada no contexto da Ordem).

## Decision

**Option B, com o mecanismo de resolução de Option D aplicado apenas onde a evidência sustenta — a duplicação `Activity`/`Project`.** `Task` pertence exclusivamente ao **Project Domain** — Owner de Domain Layer confirmado, reafirmando `ENG-0011` item 8. `Activity Domain` **não possui** um Entity `Task` próprio: sua responsabilidade "Tarefas" (`DOMAIN_MODEL.md § ACTIVITY DOMAIN`) é cumprida por **referência ao `Task` de `Projects` por id** — mesmo padrão de referência já usado em toda esta plataforma (`Identity`/`Organization` como Open Host Service, `Audit` como Anti-Corruption Layer). Qualquer domínio que precise associar-se a um `Task` (`Sales`, via `Opportunity`; a camada transversal de IA, via `ADR-0014`) faz por id, nunca por posse.

A sobreposição de nome com o `Task` de `BACKLOG.md` (hierarquia de planejamento de produto) é formalmente registrada como uma questão **distinta e não resolvida** — não decidida por esta ADR.

## Consequences

**Positivas:**
- Encerra a segunda das duas violações originais de `DOMAIN_MODEL.md` (a primeira, `Queue`/`Automation`/`System`, já resolvida por `ADR-0013`) — restando, após esta ADR, zero duplicações de objeto entre domínios ativos, sujeito a sincronização futura do documento canônico (ver Domain Impact).
- Formaliza, pela primeira vez em ADR, o padrão de resolução "Owner único + referência por id" que `DOMAIN_OWNERSHIP.md` já vinha aplicando informalmente desde `ENG-0012` — não inventa o padrão, só o eleva a decisão rastreável.
- Não contradiz nenhuma decisão formal do CTO ainda válida — disciplina mantida mesmo sob pressão de um sinal textual concorrente real.

**Negativas / pendências:**
- A pergunta estrutural de `AGGREGATE_DISCOVERY.md § Projects` — se `Task` é Entity interna de `Project` ou Aggregate Root próprio — **permanece aberta**, não decidida por esta ADR (é uma pergunta de modelagem tática, não de Ownership de domínio).
- A sobreposição de nome com `BACKLOG.md § Epic→Feature→Story→Task→Subtask` permanece registrada, não resolvida — recomenda-se Discovery própria antes de qualquer especificação de produto que use o termo "Task" nesse segundo sentido.
- `DOMAIN_MODEL.md § ACTIVITY DOMAIN` continua listando `Task` em seus "Objetos" — **não alterado por esta missão** (não solicitado pela Ordem de Missão `ENG-0027`, que não repete a autorização explícita de `ENG-0024`/`ENG-0026`). Divergência registrada, não corrigida no documento canônico.

## Domain Impact

- Nenhuma Entity, Aggregate, Value Object, service ou contract foi criado.
- `DOMAIN_MODEL.md` não foi alterado — a duplicação textual de `Task` entre `ACTIVITY DOMAIN` e `PROJECT DOMAIN` permanece no documento, registrada não corrigida (mesmo tratamento já dado a `AI`/`Automation`/`Knowledge` entre suas respectivas ADRs e as missões de reconciliação `ENG-0024`/`ENG-0026`).
- `Task` confirmado como Entity de `Projects` — nenhuma mudança de Owner desde `ENG-0011`; esta ADR adiciona evidência e formaliza o mecanismo de referência, não altera a decisão em si.
- `Activity Domain` não ganha, nem perde, nenhum objeto próprio — sua responsabilidade "Tarefas" permanece cumprida por referência, nunca por posse.
- Nenhum dos 3 Kernel Domain Capabilities (`Identity`, `Organization`, `Audit`) é afetado.

## Responsável

Decisão de arquitetura: Engenheiro Principal, por delegação da Ordem de Missão `ENG-0027`, formalizando com evidência própria uma decisão já tomada pelo CTO (`ENG-0011` item 8) e um padrão de referência já praticado por `DOMAIN_OWNERSHIP.md` desde `ENG-0012`. Execução: Engenheiro Principal.

## Data

2026-07-16

## Impactos

Criado: `adr/ADR-0016-task-ownership.md`. Nenhum código, service, Entity, Aggregate ou contract criado/alterado. `DOMAIN_MODEL.md` não alterado — fora de escopo explícito desta missão.

## Plano de Migração

Não aplicável — nenhum código ou dado real referenciava `Task` antes desta decisão; nenhuma mudança de Owner desde `ENG-0011`.

## Status

Aceito

---

## Relação com Outros Módulos

- [DOMAIN_MODEL.md](../knowledge/core/DOMAIN_MODEL.md) — seções `ACTIVITY DOMAIN`/`PROJECT DOMAIN`, duplicação textual não alterada
- [UBIQUITOUS_LANGUAGE.md § Domínio: Activity](../knowledge/core/UBIQUITOUS_LANGUAGE.md) — distinção `Activity`/`Task`, definição funcional, nota sobre `BACKLOG.md`
- [BOM.md](../knowledge/core/BOM.md) — definição de `Task`
- [knowledge/core/BACKLOG.md](../knowledge/core/BACKLOG.md) — fonte do segundo conceito "Task" (planejamento de produto), sobreposição não resolvida
- [knowledge/architecture/decisions/DOMAIN_OWNERSHIP.md § 3](../knowledge/architecture/decisions/DOMAIN_OWNERSHIP.md) — origem do padrão "Owner + referência por id", formalizado por esta ADR
- [knowledge/architecture/decisions/AGGREGATE_DISCOVERY.md § 3](../knowledge/architecture/decisions/AGGREGATE_DISCOVERY.md) — pergunta estrutural aberta (Entity vs. Aggregate Root), não resolvida por esta ADR
- [ADR-0012-queue-ownership.md](ADR-0012-queue-ownership.md) — precedente metodológico direto (mesmo critério "Responsável por", desfecho diferente por razão explícita)
- [knowledge/architecture/CONTEXT_RELATIONSHIPS.md § Decisão Formal do CTO](../knowledge/architecture/CONTEXT_RELATIONSHIPS.md) — item 8, decisão original reafirmada
