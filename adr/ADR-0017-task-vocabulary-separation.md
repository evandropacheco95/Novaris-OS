# ADR-0017 — Task Vocabulary Separation: Operational Task ≠ Planning Task

## Context

`ADR-0016` (ENG-0027) confirmou `Task` como Entity exclusiva do `Project Domain`, e registrou — sem resolver — uma sobreposição de nome com `BACKLOG.md § Hierarquia`: **`Epic → Feature → Story → Task → Subtask`**. `ENG-0028` (Domain Model Reconciliation III) sincronizou `DOMAIN_MODEL.md` para essa decisão, mas preservou a mesma pendência explicitamente como "preocupação futura, não resolvida". Esta ADR é essa Discovery pendente.

`UBIQUITOUS_LANGUAGE.md § Domínio: Activity` já continha o primeiro sinal formal do problema, na entrada de `Task`: *"Não usar para o nível `Task` da hierarquia de backlog `Epic→Feature→Story→Task→Subtask` de `BACKLOG.md` sem checar se é o mesmo conceito."* — uma advertência registrada, nunca investigada a fundo.

**Achado adicional desta missão**: existe ainda um **terceiro** uso do termo "Task/TASK", não citado pela Ordem de Missão, mas encontrado durante a análise — `NEF/PLANNING_MODEL.md` define seu próprio nível `TASK` dentro da hierarquia de **execução de engenharia** `PROGRAM → EPIC → MISSION → TASK → CHECKLIST` (a notação `ENG-XXXX` usada por toda esta engenharia, incluindo a própria Ordem de Missão `ENG-0029`, é uma instância real do nível `MISSION` dessa hierarquia — `TASK`, nela, seria uma unidade de trabalho dentro de uma missão, ex. "Escrever ROLES.md"). Este terceiro uso é **estruturalmente distinto** dos outros dois (é sobre como a NOVARIS constrói a si mesma como organização de engenharia, não sobre produto) — registrado aqui para completude, **fora do escopo de resolução desta ADR**, que trata exclusivamente da ambiguidade entre o `Task` Operacional e o `Task` de Planejamento citados pela Ordem de Missão.

## Vocabulary Analysis

| Aspecto | **Task Operacional** (`Project Domain`, `ADR-0016`) | **Task de Planejamento** (`BACKLOG.md`) |
|---|---|---|
| **Definição** | "Tarefa operacional... trabalho pendente atribuído a um `User`" (`BOM.md`/`UBIQUITOUS_LANGUAGE.md`) | Nível 4 de uma hierarquia de 5 (`Epic → Feature → Story → Task → Subtask`) — nenhuma definição de conteúdo própria, só de posição estrutural |
| **Propósito** | Objeto de negócio: unidade de trabalho executável dentro do produto **NOVARIS Projects**, usado por clientes finais (B2B) | Artefato de **metodologia de planejamento de produto** — "o quê construir" (`ADR-0008`), usado internamente pela NOVARIS para planejar a construção de **qualquer um dos 9 produtos** (`Growth`, `CRM`, `AI`, `Automation`, `Studio`, `Analytics`, **`Projects`**, `Marketplace`, `Financial`) |
| **Estado/Ciclo de vida** | `Pending` / `In Progress` / `Completed` / `Cancelled` (estados de negócio reais, `UBIQUITOUS_LANGUAGE.md`) | Campo genérico `Status`: `Não iniciado` (padrão até haver trabalho real) — não é um ciclo de vida de negócio, é um campo de gestão de projeto interno |
| **Campos associados** | `User` (atribuição) | `Dependências`, `Prioridade`, `Complexidade`, `Valor`, `Sprint`, `Critério de Aceite` — vocabulário de metodologia ágil genérica, `100% TODO` em `BACKLOG.md`, sem exceção |
| **Conteúdo real existente** | Nenhum código ainda, mas Owner, Object Specification parcial e Aggregate candidato já em discussão (`AGGREGATE_DISCOVERY.md`) | **Zero** — `BACKLOG.md § Status`: "Feature, Story, Task, Subtask... ficam `TODO` em todo o documento — nenhum conteúdo de produto foi inventado". Nenhuma instância nomeada existe em nenhum dos 9 Epics |
| **Relação com "Projects"** | É o produto/domínio que o possui | É **um dos 9 Epics** listados (`Epic: NOVARIS Projects`) — ou seja, "Task" de planejamento pode existir *dentro* do Epic que planeja construir o produto `CRM`, `AI`, `Financial`, etc. — não tem relação exclusiva com `Project Domain` |
| **Camada arquitetural** | Domain Layer (Bounded Context `Projects`) | Meta-processo de planejamento de produto — nem Domain Layer, nem Product Layer, nem Infrastructure — é sobre *como a NOVARIS decide o que construir*, não sobre o que a plataforma faz em produção |

**Conclusão da análise de vocabulário**: os dois termos compartilham a palavra "Task" e uma vaga semântica comum ("unidade de trabalho"), mas descrevem coisas categoricamente diferentes — um é dado de produção referenciado por um `User` real dentro de um produto real; o outro é um nível de um template de planejamento interno, sem nenhuma instância, campo ou regra de negócio própria, aplicável a qualquer um dos 9 produtos, não específico de `Projects`.

## Evidence

- `BACKLOG.md` linha 3: "este documento responde 'o quê construir'" — explicitamente um artefato de planejamento, não de domínio de negócio.
- `BACKLOG.md § Índice de Epics`: `NOVARIS Projects` é **um dos 9 Epics**, no mesmo nível de `NOVARIS CRM`/`NOVARIS AI`/`NOVARIS Financial` — prova direta de que a hierarquia de `BACKLOG.md` não é específica do `Project Domain`.
- `BACKLOG.md § Status`: confirma 100% `TODO` em `Feature`/`Story`/`Task`/`Subtask` e todos os campos de metodologia — zero conteúdo real, zero instância nomeada.
- `DOMAIN_MODEL.md § PROJECT DOMAIN`, "Objetos": já lista `Epic`, `Story`, `Task` (mas não `Feature`/`Subtask`) — presença parcial e coincidente, não uma cópia do esquema de `BACKLOG.md` (faltam 2 dos 5 níveis).
- `UBIQUITOUS_LANGUAGE.md § Domínio: Activity`, entrada `Task`: já registrava a suspeita de sobreposição, nunca investigada.
- `AGGREGATE_DISCOVERY.md § Projects`: trata `Task` como candidato a Entity/Aggregate Root de **negócio** — nenhuma menção à hierarquia de planejamento de `BACKLOG.md`, confirmando que a Discovery de Aggregate já tratava os dois como não relacionados, implicitamente.
- `ENG-0000.5` (Foundation Freeze, plano já executado nesta sessão): já havia classificado `BACKLOG.md` como "modelo de planejamento de **produto** (o quê construir), complementar ao `PLANNING_MODEL.md` de execução de **engenharia** (como construir)" — confirmação independente e anterior a esta missão de que `BACKLOG.md` nunca foi concebido como fonte de Domain Layer.

## Options

### Option A — Both Tasks represent the same domain concept

**Rejeitada.** A análise de vocabulário não sustenta identidade: campos, propósito, ciclo de vida, camada arquitetural e relação com `Projects` divergem em todos os pontos comparados. Tratá-los como o mesmo conceito exigiria ignorar que `BACKLOG.md`'s "Task" pode existir dentro do Epic `NOVARIS CRM` sem nenhuma relação com o `Project Domain`.

### Option B — They are different concepts requiring different names

**Escolhida.** Evidência consistente e completa: são dois vocabulários de proveniência, propósito e camada diferentes, que só coincidem na palavra em inglês "Task" — coincidência de nomenclatura, não de conceito. Resolvida por **qualificação de referência**, não por invenção de um nome de produto novo (ver Naming Impact).

### Option C — One should be deprecated

**Rejeitada.** Nenhum dos dois é redundante: o Task Operacional é o Entity confirmado de um domínio de negócio real (`ADR-0016`); o Task de Planejamento é um nível estrutural de uma metodologia de backlog já formalmente adotada (`ENG-0000.5`, `ADR-0008`) e aplicada a **todos** os 9 produtos, não apenas a `Projects` — depreciar qualquer um dos dois removeria uma peça já em uso por outra parte da arquitetura.

## Decision

**Option B.** Os dois "Task" são conceitos distintos, mantidos como estão, **desambiguados por qualificação de nome em toda referência textual futura**, não por renomeação do conteúdo original de nenhum dos dois documentos-fonte:

- **`Operational Task`** (ou, em português, "Tarefa Operacional") — o Entity confirmado do `Project Domain` (`ADR-0016`). Referência formal recomendada: `Task (Project Domain)`.
- **`Planning Task`** (ou "Tarefa de Planejamento") — o nível 4 da hierarquia de `BACKLOG.md`, artefato de metodologia de planejamento de produto, não um conceito de Domain Layer. Referência formal recomendada: `Task (Backlog Level)`.

Nenhum dos dois textos-fonte (`DOMAIN_MODEL.md § PROJECT DOMAIN`, `BACKLOG.md § Hierarquia`) é alterado por esta ADR — ambos permanecem exatamente como estão; a resolução é uma **convenção de citação**, aplicável à documentação e ao código futuros, não uma mudança de conteúdo retroativa.

## Naming Impact

- Toda documentação futura que precise citar ambos os conceitos no mesmo contexto (ex.: uma especificação do produto `NOVARIS Projects` que também aparece como Epic em `BACKLOG.md`) deve qualificar explicitamente qual "Task" está em uso — `Task (Project Domain)` vs. `Task (Backlog Level)` — para não repetir a ambiguidade que motivou esta ADR.
- Nenhuma migração de nome é necessária hoje: `BACKLOG.md`'s "Task" não tem nenhuma instância real (100% `TODO`); `Project Domain`'s "Task" também não tem código implementado ainda — não há dado real para renomear em nenhum dos dois lados.
- Recomenda-se (não decidido aqui, fora de escopo) que, quando `specifications/projects/` for preenchido, seu Object Specification de `Task` cite esta ADR para evitar reintroduzir a ambiguidade.
- O terceiro uso identificado (`NEF/PLANNING_MODEL.md`'s `TASK` de execução de engenharia) já é suficientemente distinto por contexto documental (`NEF/` vs. `knowledge/core/`) e não recebe qualificação adicional por esta ADR — registrado, não requer ação.

## Future Consequences

1. Quando `Project Domain` avançar para Aggregate Design Freeze (pendência já registrada em `AGGREGATE_DISCOVERY.md § 3` — Entity interna de `Project` ou Aggregate Root próprio), essa missão deve citar esta ADR ao nomear a Ubiquitous Language de `Task`, garantindo que a qualificação `Task (Project Domain)` seja usada desde o primeiro Object Specification real.
2. Quando `specifications/projects/features.md` ou qualquer outro dos 8 demais `specifications/<domínio>/features.md` for preenchido, referências a "Task" nesse contexto de planejamento devem citar `BACKLOG.md`/esta ADR para deixar claro que se trata do nível de backlog, não do Entity de `Projects`.
3. Este é o primeiro caso, nesta engenharia, de uma ambiguidade de nome resolvida por **convenção de citação** em vez de remoção/reatribuição de Ownership (diferente de `Queue`, `AI`, `Automation`, `Knowledge`, todos resolvidos por reclassificação de domínio) — precedente útil para futuros casos onde dois conceitos genuinamente distintos apenas compartilham uma palavra comum, sem que um exclua o outro.
4. Recomenda-se que `ARCHITECTURE_GOVERNANCE.md` seja atualizado, em missão futura, para nomear um terceiro princípio ("Homonímia Não É Sobreposição" ou equivalente) a partir deste precedente — não executado aqui, fora de escopo desta ADR.

## Responsável

Decisão de arquitetura: Engenheiro Principal, por delegação da Ordem de Missão `ENG-0029`, resolvendo a pendência explicitamente registrada por `ADR-0016`/`ENG-0028`. Execução: Engenheiro Principal.

## Data

2026-07-16

## Impactos

Criado: `adr/ADR-0017-task-vocabulary-separation.md`. Nenhum código, service, Entity, Aggregate ou contract criado/alterado. `DOMAIN_MODEL.md` e `BACKLOG.md` não alterados — nenhuma mudança de conteúdo, apenas convenção de citação recomendada para uso futuro.

## Plano de Migração

Não aplicável — nenhuma instância real de nenhum dos dois conceitos existe hoje para migrar.

## Status

Aceito

---

## Relação com Outros Módulos

- [ADR-0016-task-ownership.md](ADR-0016-task-ownership.md) — origem direta da pendência resolvida por esta ADR
- [knowledge/core/BACKLOG.md](../knowledge/core/BACKLOG.md) — fonte do Task de Planejamento, não alterada
- [knowledge/core/DOMAIN_MODEL.md § PROJECT DOMAIN](../knowledge/core/DOMAIN_MODEL.md) — fonte do Task Operacional, não alterada
- [knowledge/core/UBIQUITOUS_LANGUAGE.md § Domínio: Activity](../knowledge/core/UBIQUITOUS_LANGUAGE.md) — origem da advertência original sobre a sobreposição
- [knowledge/architecture/decisions/AGGREGATE_DISCOVERY.md § Projects](../knowledge/architecture/decisions/AGGREGATE_DISCOVERY.md) — pergunta estrutural ainda aberta (Entity vs. Aggregate Root), não afetada por esta ADR
- [NEF/PLANNING_MODEL.md](../NEF/PLANNING_MODEL.md) — terceiro uso do termo "TASK" (execução de engenharia), registrado, fora de escopo
- [adr/ADR-0008-foundation-freeze.md](ADR-0008-foundation-freeze.md) — classificação original de `BACKLOG.md` como planejamento de produto, base desta ADR
