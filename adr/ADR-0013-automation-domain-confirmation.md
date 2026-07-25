# ADR-0013 — Automation Domain Confirmation: Platform Capability, Not Business Domain

## Problema

`ENG-0011` (decisão formal do CTO, item 6) já declarou: *"`AI` e `Automation` NÃO são Business Domains neste momento — hoje existem apenas `AI Runtime` e `Automation Runtime` como Infrastructure Capabilities. Qualquer `AI Domain`/`Automation Domain` permanece Future Domain."* Essa frase resolveu a questão em prosa, mas nunca recebeu uma Discovery formal com evidência própria — diferente do tratamento já dado a `Permission` (EPIC-004), `Event Bus` (EPIC-006) e `CRM` (`ADR-0011`), cada um confirmado por um processo de 6 critérios/3 perguntas antes de qualquer ADR. `ADR-0012` (ENG-0020) já assumiu a confirmação de `Automation` como pendência explícita ao decidir o Owner de `Queue` — toda a cadeia de objetos de `Automation` em `DOMAIN_OWNERSHIP.md` permanece `Ownership Pending` exatamente por essa razão. Esta ADR fecha essa lacuna: aplica a Discovery formal, com o mesmo rigor já usado nos três casos anteriores, e converte a frase de `ENG-0011` item 6 em decisão de arquitetura rastreável.

**Nota**: a Ordem de Missão `ENG-0022` referencia "previous Automation discovery documents" — nenhum documento dedicado com esse nome existe no repositório (confirmado por busca). A evidência usada abaixo está dispersa em `DOMAIN_MODEL.md`, `UBIQUITOUS_LANGUAGE.md`, `KERNEL_BOUNDARY_REVIEW.md`, `AGGREGATE_DISCOVERY.md` e `DOMAIN_OWNERSHIP.md` — consolidada aqui pela primeira vez.

## Contexto

`DOMAIN_MODEL.md` nomeia `AUTOMATION DOMAIN` como um dos 13 domínios de negócio, com seção própria "Responsável por" (Workflows, Triggers, Queues, Execuções) e "Objetos" (`Workflow`, `Automation`, `Execution`, `Trigger`, `Action`, `Condition`, `Queue`) — presença estrutural igual à de qualquer outro domínio confirmado (`Sales`, `Customer`, etc.).

Em paralelo, `services/kernel/automation-runtime/` é a única implementação real associada ao nome "Automation" — um scaffolding sem código (`Status: 🚧 Estrutura criada, nenhuma implementação`), classificado por `KERNEL_BOUNDARY_REVIEW.md` (ENG-0007, baseado em inspeção direta do código real) como **Infrastructure Capability** ("Execução de workflows e automações"), na mesma categoria de confiança "por inferência estrutural, sem Discovery própria" — junto de `files`, `notifications`, `realtime`, `search`, `monitoring`, `scheduler`, `ai-runtime`.

## Problem Statement

Dois tratamentos coexistem para o mesmo nome — "Automation" é, ao mesmo tempo, (1) um dos 13 domínios estruturados de `DOMAIN_MODEL.md`, com objetos e responsabilidades nomeados, e (2) uma Infrastructure Capability já classificada por inspeção de código real. Nenhuma Discovery formal jamais testou se (1) é um Bounded Context genuíno ou apenas um agrupamento nominal de objetos técnicos que (2) já executa. Sem essa confirmação, `Queue` (`ADR-0012`) e outros 6 objetos (`DOMAIN_OWNERSHIP.md`) permanecem indefinidamente presos em `Ownership Pending`, e qualquer especificação de produto `Automation` (`PRODUCTS.md`) não tem base de domínio sobre a qual se apoiar.

**Pergunta a decidir**: `Automation` deve ser (A) confirmado como Business Domain/Bounded Context genuíno; (B) reclassificado permanentemente como Platform/Infrastructure Capability, sem Bounded Context próprio; ou (C) absorvido como parte de outro domínio já existente?

## Evidence

Aplicação do mesmo método de 6 critérios/3 perguntas já usado para `Permission`, `Event Bus` e `CRM`:

| Critério | Achado | Fonte |
|---|---|---|
| **Linguagem ubíqua própria** | Existe uma seção dedicada, "Domínio: Automation", com 3 termos definidos (`Workflow`, `Automation`, `Queue`) e 1 evento nomeado (`WorkflowExecuted`) | `UBIQUITOUS_LANGUAGE.md §§ Domínio: Automation` |
| **Entidades nomeadas** | `Workflow`, `Automation`, `Execution`, `Trigger`, `Action`, `Condition`, `Queue` — nomeados em `DOMAIN_MODEL.md`, mas cada um com definição de 1 frase em `BOM.md` ("Workflow: Fluxo automatizado.", "Automation: Automação executável.", "Queue: Fila de processamento.") — sem atributo, sem invariante | `DOMAIN_MODEL.md § AUTOMATION DOMAIN`, `BOM.md` |
| **Aggregate candidato** | **Nenhum.** `AGGREGATE_DISCOVERY.md § Automation` classifica explicitamente como `Aggregate Pending Discovery (domínio não confirmado)` — mesma categoria de `AI`/`Knowledge`, sem nenhum candidato oferecido, diferente de `Sales` (`Opportunity`) ou `Customer` (`Party`) | `AGGREGATE_DISCOVERY.md § 3` |
| **Value Object candidato** | Nenhum documentado | — |
| **Ciclo de vida com significado de negócio** | Não documentado — nenhuma fonte descreve estados, transições ou regras de transição de um `Workflow`/`Trigger`/`Action` | — |
| **Regra de negócio** | Nenhuma — nenhuma invariante, validação ou política de negócio existe para qualquer objeto da lista | — |
| **Especificação de produto** | `specifications/automation/` — 46 linhas totais, 9 de 10 arquivos como stub de 3 linhas, `TODO` — mesma emptiness já confirmada para `CRM` antes de seu bloqueio (`PRODUCT_DOMAIN_ARCHITECTURE.md § 2`) | Inspeção direta, confirmada nesta missão |
| **Implementação real** | `services/kernel/automation-runtime/` — zero código, classificado por inspeção real como Infrastructure Capability | `KERNEL_BOUNDARY_REVIEW.md § 2` |
| **Objeto mais citado (`Queue`) já avaliado** | `CRM_DOMAIN_DISCOVERY.md § 7` já concluiu que `Queue` "aponta para objeto operacional/técnico, não Aggregate Root de negócio" em toda fonte que o cita — inclusive nas duas listas de `Automation`/`System` | `CRM_DOMAIN_DISCOVERY.md § 7`, carregado por `ADR-0012` |
| **Decisão prévia do CTO** | `ENG-0011` item 6 já declarou `Automation` "não é Business Domain hoje... permanece Future Domain" — nenhuma evidência coletada nesta missão contradiz essa afirmação; toda evidência nova a reforça | `CONTEXT_RELATIONSHIPS.md § Decisão Formal do CTO` |

**Resultado do método**: dos 6 critérios estruturais (linguagem ubíqua, Entity, Aggregate, Value Object, ciclo de vida, regra de negócio), apenas 1 (linguagem ubíqua, parcial — 3 termos de 1 frase cada) tem alguma base documental. Os demais 5 são negativos ou ausentes. Comparável ao padrão que já resultou em "não é domínio" para `Permission` (falhou o teste estrutural de Aggregate) e `Event Bus` (Infrastructure por fonte pré-existente) — mais forte que `CRM` (que teve 0 de 6, `DOMAIN_MODEL.md` negando sua existência), mas ainda muito abaixo do padrão mínimo (`Sales`/`Customer`, que têm Aggregate candidato com critério estrutural real, `AGGREGATE_DISCOVERY.md`).

## Options Considered

### Option A — Automation is an official Business Domain / Bounded Context

**Rejeitada.** Exigiria inventar Aggregate, ciclo de vida e regra de negócio inteiros sem nenhuma fonte — `AGGREGATE_DISCOVERY.md` já se recusou a nomear um candidato por essa exata razão. Contradiria diretamente `ENG-0011` item 6, decisão formal do CTO ainda vigente, sem nenhuma evidência nova que a justifique reverter.

### Option B — Automation is only a Platform Capability

**Escolhida.** Consistente com: (a) a decisão já formal do CTO (`ENG-0011` item 6); (b) a classificação por inspeção de código real de `automation-runtime` como Infrastructure Capability (`KERNEL_BOUNDARY_REVIEW.md`); (c) a ausência total de Aggregate candidato (`AGGREGATE_DISCOVERY.md`); (d) a especificação de produto 100% vazia; (e) a natureza já confirmada de `Queue` como objeto técnico/operacional, não Aggregate de negócio. Não inventa nenhum conteúdo novo — apenas formaliza, com evidência própria, o que já era verdade.

### Option C — Automation belongs inside another existing Domain

**Rejeitada por ausência de evidência.** Nenhuma fonte pesquisada sugere que `Workflow`/`Trigger`/`Action`/`Condition`/`Execution` pertençam à linguagem ubíqua de `Sales`, `Customer`, `Projects` ou qualquer outro domínio de negócio já confirmado — são conceitos técnicos transversais (qualquer domínio de negócio poderia, em tese, disparar uma automação), não um conjunto de objetos com Owner de negócio único. A mesma lógica já aplicada a `Event Bus` (Infrastructure transversal, não pertencente a nenhum domínio específico) se aplica aqui.

## Architectural Decision

**Option B.** `Automation` é, formalmente, uma **Platform Capability** (Infrastructure), não um Business Domain/Bounded Context. Não existe, e não deve ser criado, nenhum `services/domains/automation/`, Aggregate, Repository ou entrada de Business Domain com esse nome. `services/kernel/automation-runtime/` permanece a implementação de referência, já corretamente classificada como Infrastructure Capability por `KERNEL_BOUNDARY_REVIEW.md`.

Isso **confirma, não reverte**, `ENG-0011` item 6 — eleva uma frase de decisão informal a uma ADR com evidência rastreável, mesmo tratamento já dado a `Event Bus` (`EVENT_BUS_EPIC_CLOSURE.md`, que confirmou com Discovery formal o que `ENGINEERING_PLAYBOOK.md § 5` já dizia).

## Consequences

**Positivas:**
- Encerra definitivamente a pendência mais antiga ainda aberta em `NOVARIS_PLATFORM_ARCHITECTURE.md § 12` ("Confirmação de `AI`/`Automation` como Business Domain").
- Resolve, sem inventar conteúdo, a órfandade de `Queue` (ver "Queue Dependency Resolution" abaixo).
- Reforça o precedente já estabelecido por `Event Bus`/`CRM`: um nome presente em `DOMAIN_MODEL.md` não é, por si, prova de Bounded Context — precisa de Aggregate, linguagem ubíqua completa e regra de negócio real.

**Negativas / pendências:**
- `DOMAIN_MODEL.md` continua nomeando "AUTOMATION DOMAIN" como um dos 13 domínios — **não alterado por esta missão** (restrição explícita de `ENG-0022`). A divergência entre o texto de `DOMAIN_MODEL.md` e esta ADR fica registrada, não corrigida no documento canônico — mesmo tratamento já dado à duplicação `Queue`/Automation/System por `ADR-0012`.
- `AI` (o outro domínio citado por `ENG-0011` item 6 junto de `Automation`) **não é resolvido por esta ADR** — permanece pendente, escopo explicitamente fora desta missão (que cobre só `Automation`).
- Se, no futuro, `Workflow`/`Trigger`/`Action` ganharem especificação de produto real e Aggregate candidato genuíno, uma nova Discovery pode reabrir esta questão — esta ADR não é permanente por definição, é uma confirmação do estado atual da evidência.

### Queue Dependency Resolution

`ADR-0012` atribuiu `Queue` a `Automation` como Owner de Domain Layer, explicitamente "sujeito à confirmação de `Automation` como Business Domain". Essa confirmação resolveu-se **negativamente** (Option B) — `Automation` não é, e não será tratado como, um Owner de Domain Layer. Isso não reabre uma nova órfandade (como aconteceu com `CRM`): `CRM_DOMAIN_DISCOVERY.md § 7` já havia determinado, de forma independente, que `Queue` é um **objeto técnico/operacional**, não um Aggregate Root de negócio, em toda fonte que o cita. A resolução final, portanto, é: **`Queue` é um construto técnico da Platform Capability `Automation`** (junto de `event-bus`, `scheduler`), **sem Owner de Domain Layer — porque não é um conceito de Domain Layer**. Não é um novo item `Ownership Pending`; é uma reclassificação de categoria (de "aguardando Owner de domínio" para "não é conceito de domínio"), coerente com o mesmo destino já dado a `Permission` (Value Object, não Aggregate) e à distinção Domain/Infrastructure já usada em toda esta engenharia.

## Domain Model Impact

- Nenhuma Entity, Aggregate, Value Object, Domain Event, Repository, service ou contrato foi criado.
- `DOMAIN_MODEL.md` não foi alterado — a nomenclatura "AUTOMATION DOMAIN" nele permanece, registrada como divergente desta ADR, não corrigida (fora de escopo).
- `Queue` deixa definitivamente a categoria `Ownership Pending CTO Decision`/`Ownership Pending Business Domain Confirmation` em `DOMAIN_OWNERSHIP.md` — não porque ganhou Owner de domínio, mas porque foi reclassificado como conceito de Infrastructure, fora do escopo de "Ownership de Domain Layer".
- Os demais 6 objetos de `Automation` (`Workflow`, `Automation`, `Execution`, `Trigger`, `Action`, `Condition`) recebem o mesmo tratamento — reclassificados de "Ownership Pending Business Domain Confirmation" para "conceitos de Platform Capability, fora do escopo de Domain Ownership", pela mesma decisão.
- Nenhum dos 3 Kernel Domain Capabilities (`Identity`, `Organization`, `Audit`) é afetado.

## Responsável

Decisão de arquitetura: Engenheiro Principal, por delegação da Ordem de Missão `ENG-0022`, formalizando com evidência própria uma decisão já tomada em prosa pelo CTO (`ENG-0011` item 6). Execução: Engenheiro Principal.

## Data

2026-07-16

## Impactos

Criado: `adr/ADR-0013-automation-domain-confirmation.md`. Atualizações de referência de ownership avaliadas e aplicadas onde necessário (ver Modified files do relatório final da missão). Nenhum código, service, Entity, Aggregate ou contrato criado/alterado. `DOMAIN_MODEL.md` e `AI` (domínio irmão, mesma pendência de `ENG-0011` item 6) não alterados — fora de escopo.

## Plano de Migração

Não aplicável — nenhum código ou dado real referenciava `Automation` como Domain Layer antes desta decisão.

## Status

Aceito

---

## Relação com Outros Módulos

- [DOMAIN_MODEL.md](../knowledge/core/DOMAIN_MODEL.md) — seção `AUTOMATION DOMAIN`, fonte da nomenclatura divergente, não alterada
- [UBIQUITOUS_LANGUAGE.md](../knowledge/core/UBIQUITOUS_LANGUAGE.md) — seção "Domínio: Automation", única fonte de linguagem ubíqua parcial
- [BOM.md](../knowledge/core/BOM.md) — definições de 1 frase de `Workflow`/`Automation`/`Queue`
- [services/kernel/KERNEL_BOUNDARY_REVIEW.md](../services/kernel/KERNEL_BOUNDARY_REVIEW.md) — classificação de `automation-runtime` como Infrastructure Capability, por inspeção real
- [knowledge/architecture/decisions/AGGREGATE_DISCOVERY.md](../knowledge/architecture/decisions/AGGREGATE_DISCOVERY.md) — `Aggregate Pending Discovery` para `Automation`
- [knowledge/architecture/decisions/DOMAIN_OWNERSHIP.md](../knowledge/architecture/decisions/DOMAIN_OWNERSHIP.md) — os 7 objetos de `Automation`, reclassificados por esta ADR
- [ADR-0012-queue-ownership.md](ADR-0012-queue-ownership.md) — origem direta da pendência resolvida por esta ADR
- [knowledge/architecture/analysis/CRM_DOMAIN_DISCOVERY.md](../knowledge/architecture/analysis/CRM_DOMAIN_DISCOVERY.md) — precedente metodológico e fonte da conclusão sobre `Queue` como objeto técnico
- [knowledge/architecture/decisions/NOVARIS_PLATFORM_ARCHITECTURE.md](../knowledge/architecture/decisions/NOVARIS_PLATFORM_ARCHITECTURE.md) — § 12, pendência agora resolvida
