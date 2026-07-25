# ADR-0019 — NOVARIS Macro Architecture Freeze Validation

## Current State

Desde `ENG-0009` (início do EPIC-007), 8 ADRs sequenciais (`ADR-0011` a `ADR-0018`) resolveram, com Discovery formal e evidência rastreável, toda pendência nomeada de posição de domínio/produto então conhecida:

| Item | Posição Final | ADR |
|---|---|---|
| `CRM` | Product Layer, sem Bounded Context | `ADR-0011` |
| `Queue` | Reclassificado (técnico, sem Owner de Domain Layer) | `ADR-0012` |
| `Automation` | Platform Capability | `ADR-0013` |
| `AI` | Transversal Intelligence Layer | `ADR-0014` |
| `Knowledge` | Absorvido pela camada de IA | `ADR-0015` |
| `Task` (Ownership) | Entity de `Project Domain` | `ADR-0016` |
| `Task` (Vocabulário) | Desambiguado de `BACKLOG.md` | `ADR-0017` |
| `Studio` | Product Layer (composição) | `ADR-0018` |
| `Marketplace` | Product Layer (composição) | `ADR-0018` |

Em paralelo, `DOMAIN_MODEL.md` foi sincronizado três vezes (`ENG-0024`, `ENG-0026`, `ENG-0028`) para refletir essas decisões no documento canônico, e as duas violações originais de duplicação de objeto (`Queue`, `Task`) foram eliminadas. `services/kernel/` tem sua classificação Domain/Infrastructure confirmada (`KERNEL_BOUNDARY_REVIEW.md`), exceto `configuration`/`feature-flags`. Três Domain Capabilities do Kernel (`Identity`, `Organization`, `Audit`) têm Freeze tático próprio, código real e testes passando. `packages/shared-kernel` está confirmado por 3 reutilizações empíricas independentes.

Esta ADR avalia se esse estado é suficiente para declarar a macro arquitetura **congelada** e autorizar a fase de implementação de novos domínios de negócio.

## Evidence

**Congelado, com evidência forte e repetida:**
- Distinção Product Layer vs. Domain Layer (`ADR-0007`), aplicada com sucesso a 9 de 9 produtos de `PRODUCTS.md` (`Growth`, `CRM`, `AI`, `Automation`, `Studio`, `Analytics`, `Projects`, `Marketplace`, `Financial` — os 5 primeiros e os 2 últimos desta lista via composição confirmada; `Analytics`/`Projects` são, eles mesmos, também Business Domains).
- 10 de 13 seções de domínio originais de `DOMAIN_MODEL.md` confirmadas como Business Domains ativos, zero duplicação de objeto entre elas (`ENG-0028`).
- Ordem de precedência documental (`ENG-0011` item 2, `NOVARIS_PLATFORM_ARCHITECTURE.md § 4`) — aplicada sem exceção em toda decisão desde `ENG-0011`.
- Classificação Domain/Infrastructure do Kernel — 17 de 19 módulos classificados com confiança (`KERNEL_BOUNDARY_REVIEW.md`).
- Shared Kernel — reutilizado sem modificação por `Identity`, `Organization`, `Audit` (3ª confirmação empírica, `AUDIT_FINAL_ARCHITECTURE_REVIEW.md § 8`).
- Regras de dependência entre domínios e de referência por id — confirmadas sem violação nos 3 contextos implementados.
- Método de Discovery (6 critérios/3 perguntas) — aplicado com sucesso e consistência em 7 casos (`Permission`, `Event Bus`, `CRM`, `Automation`, `AI`, `Knowledge`, `Studio`/`Marketplace`), sempre citando evidência decisiva, nunca invenção.

**Não congelado — pendências reais, listadas em `NOVARIS_PLATFORM_ARCHITECTURE.md § 12`:**
- **23 conceitos** com `Ownership Pending CTO Decision` (`DOMAIN_OWNERSHIP.md § 7`) — `Session`/`IdentityProvider`/`Token` (Identity), `Team`/`Plan`/`Workspace` (Organization), 7 objetos de `System`, 10 objetos de `BOM.md` sem domínio.
- **7 perguntas de Aggregate Design** (`AGGREGATE_DISCOVERY.md § 4`) — `Party` vs. `Person`/`External Organization`; `Task` como Entity ou Aggregate Root; `Widget` como Entity ou Aggregate; `Invoice` vs. `Subscription`; Discovery formal completa ainda pendente para `Sales`, `Customer`, `Marketing`, `Projects`, `Financial`, `Analytics`, `Activity` — os 7 Business Domains ativos que ainda não têm nenhuma Discovery dedicada.
- **Reconciliação das 6 listas de domínio/produto** divergentes — nunca unificada, apenas documentada.
- **`configuration`/`feature-flags`** — "Discovery Required", risco real de conterem regra de negócio genuína de `Organization` (RN007).
- **`users`/`roles`** — scaffolding do Kernel nunca formalmente encerrado (mesma natureza de `permissions` pré-`EPIC-004`).
- **ADR do mecanismo de enriquecimento de `Audit`** — recomendada desde `AUDIT_DOMAIN_DECISIONS.md § 5`, nunca criada.
- **Payload ausente em `DomainEvent`** — nenhum evento implementado carrega dado de negócio.

## Options

### Option A — Architecture Frozen, ready for domain implementation

**Rejeitada.** Exigiria que nenhum item de `§ 12` existisse — 7 categorias de pendência real permanecem, incluindo a mais crítica para qualquer implementação futura: nenhum dos 7 Business Domains ativos ainda não implementados (`Sales`, `Customer`, `Marketing`, `Projects`, `Financial`, `Analytics`, `Activity`) passou por uma Discovery formal completa. Declarar Freeze total ignoraria essa lacuna e violaria o princípio já estabelecido "Evidence Before Freeze" (`ARCHITECTURE_GOVERNANCE.md § 2`).

### Option B — Architecture Frozen with documented exceptions

**Escolhida.** A camada **macro/estratégica** (o que é domínio, o que é produto, quais domínios existem, como o Kernel se divide, qual documento manda sobre qual assunto) está genuinamente estável — testada repetidamente, nunca revertida sem invalidação formal, aplicada com sucesso a 9 casos distintos. A camada **tática** (Aggregate exato de cada domínio de negócio ainda não implementado, Ownership de conceitos secundários, 2 módulos de Kernel não classificados) permanece aberta **por design** — não é uma falha da arquitetura, é o trabalho normal e esperado de cada futura missão de Discovery de domínio, seguindo `KERNEL_DOMAIN_LIFECYCLE_V2.md`.

### Option C — Not ready, blocking issues remain

**Rejeitada.** Nenhuma das pendências de `§ 12` bloqueia o **início** da implementação — todas são do tipo "detalhe tático de um domínio específico ainda não iniciado" ou "conceito secundário sem Owner", nunca do tipo "a própria fronteira Domain/Product está incerta" (esse tipo de bloqueio, quando existiu — `CRM`, `Automation`, `AI`, `Knowledge` — já foi resolvido). Tratar essas pendências como bloqueantes replicaria o erro já evitado em `CRM_DOMAIN_DISCOVERY.md`: confundir "não modelado ainda" com "não pode ser modelado".

## Decision

**Option B — ARCHITECTURE FROZEN WITH DOCUMENTED EXCEPTIONS.**

A macro arquitetura da NOVARIS está formalmente congelada nos termos do "Freeze Scope" abaixo. A fase de implementação de novos domínios de negócio está **autorizada a começar**, sujeita às "Implementation Transition Rules" abaixo — cada nova implementação resolve suas próprias pendências táticas via seu próprio ciclo de Discovery→Freeze→Blueprint, sem precisar reabrir nenhuma decisão macro já tomada.

### Freeze Scope

Está **congelado** — só alterável por nova ADR que cite evidência que invalide a decisão anterior (mesmo padrão usado para reverter `Queue`/`CRM` após `ADR-0011`):

1. A distinção Product Layer vs. Domain Layer (`ADR-0007`).
2. A ordem de precedência documental (`ENG-0011` item 2).
3. A lista de 10 Business Domains ativos e seus nomes canônicos (`DOMAIN_MODEL.md`, pós-`ENG-0028`).
4. A posição arquitetural de `CRM`, `Automation`, `AI`, `Knowledge`, `Task`, `Studio`, `Marketplace` (`ADR-0011`–`ADR-0018`).
5. A classificação Domain/Infrastructure dos 17 módulos já classificados do Kernel (`KERNEL_BOUNDARY_REVIEW.md`), exceto `configuration`/`feature-flags`.
6. O padrão Shared Kernel e os 3 Domain Capabilities já implementados (`Identity`, `Organization`, `Audit`).
7. O método de Discovery de 6 critérios/3 perguntas como processo obrigatório para qualquer nova classificação de domínio.

### Allowed Future Changes

Não exigem reabrir esta ADR — são o trabalho esperado da fase de implementação:

- Discovery formal completa de qualquer um dos 7 Business Domains ativos ainda não modelados (`Sales`, `Customer`, `Marketing`, `Projects`, `Financial`, `Analytics`, `Activity`), seguindo `KERNEL_DOMAIN_LIFECYCLE_V2.md` integralmente.
- Resolução de Ownership dos 23 conceitos pendentes, um ADR por conceito ou por grupo coerente, mesmo padrão de `ADR-0012`/`ADR-0016`.
- Discovery formal de `configuration`/`feature-flags`.
- Encerramento formal de `users`/`roles` (mesmo padrão de `PERMISSION_EPIC_CLOSURE.md`).
- ADR do mecanismo de enriquecimento de `Audit`.
- Design de payload para `DomainEvent` (Shared Kernel).
- Reconciliação das 6 listas de domínio/produto, se e quando priorizada.

### Forbidden Changes

Exigem nova ADR explícita, com evidência que invalide a decisão anterior — nunca uma correção silenciosa:

- Reverter a posição de `CRM`/`Automation`/`AI`/`Knowledge`/`Task`/`Studio`/`Marketplace` sem citar evidência nova que invalide `ADR-0011`–`ADR-0018`.
- Criar `services/domains/` para qualquer item classificado como Product Layer, Platform Capability ou Transversal Layer.
- Alterar a ordem de precedência documental sem ADR.
- Modelar Aggregate, Entity, Value Object ou Domain Event para qualquer domínio sem Discovery formal prévia (violaria "Evidence Before Freeze").
- Pular o processo de `KERNEL_DOMAIN_LIFECYCLE_V2.md` (5 fases) para qualquer novo domínio.
- Iniciar Infrastructure/Application antes do Domain Layer estar congelado para aquele domínio específico ("Architecture First", já em vigor).

## Implementation Transition Rules

1. Toda nova missão de implementação de domínio (`ENG-` de código) segue `KERNEL_DOMAIN_LIFECYCLE_V2.md` (Domain Definition → Aggregate & Contract → Persistence Design → Infrastructure → Domain Closure) — mesmo processo já usado por `Identity`, `Organization`, `Audit`.
2. Toda missão de implementação produz Self Review + ACR + ARG (`ARCHITECTURE_REVIEW_GATE_STANDARD.md`, ENS-0002, 12 critérios) — sem exceção, já regra vigente.
3. Recomenda-se, mas não se exige, priorizar `Sales` como próximo domínio de Discovery — já identificado como o candidato com evidência estrutural mais forte (`Opportunity`, com `Stage`/eventos já nomeados, `AGGREGATE_DISCOVERY.md § 3`).
4. Nenhuma missão de implementação pode presumir o Owner de um conceito ainda listado em `DOMAIN_OWNERSHIP.md § 7` como `Ownership Pending` — deve primeiro resolvê-lo via ADR dedicada.
5. Link Checker, Self Review e validação de consistência arquitetural permanecem obrigatórios após todo lote de mudanças, sem exceção — mesma disciplina desde `ENG-0000`.
6. Esta ADR deve ser revisitada (não substituída) quando os 7 Business Domains ativos ainda não modelados tiverem todos passado por Discovery formal — nesse ponto, uma nova avaliação pode declarar `ARCHITECTURE FROZEN` sem exceções (Option A).

## Responsável

Decisão de arquitetura: Engenheiro Principal, por delegação da Ordem de Missão `ENG-0031`, consolidando 8 ADRs sequenciais (`ADR-0011`–`ADR-0018`) e o estado real do Kernel/Domain Layer numa validação formal de prontidão para implementação. Execução: Engenheiro Principal.

## Data

2026-07-16

## Impactos

Criado: `adr/ADR-0019-architecture-freeze.md`. Nenhum código, Entity, Aggregate, service ou contract criado/alterado. Nenhum documento existente modificado por esta ADR (análise pura, decisão registrada em documento novo).

## Plano de Migração

Não aplicável — decisão de governança, não de dado ou código.

## Status

Aceito

---

## Relação com Outros Módulos

- [ADR-0011](../knowledge/architecture/decisions/ADR-0011-crm-domain-position.md)–[ADR-0018](ADR-0018-studio-marketplace-position.md) — cadeia completa de decisões consolidada por esta ADR
- [knowledge/architecture/decisions/NOVARIS_PLATFORM_ARCHITECTURE.md § 12, § 13](../knowledge/architecture/decisions/NOVARIS_PLATFORM_ARCHITECTURE.md) — fonte de todas as pendências citadas em Evidence
- [knowledge/architecture/decisions/DOMAIN_OWNERSHIP.md § 7](../knowledge/architecture/decisions/DOMAIN_OWNERSHIP.md) — 23 conceitos pendentes
- [knowledge/architecture/decisions/AGGREGATE_DISCOVERY.md § 4](../knowledge/architecture/decisions/AGGREGATE_DISCOVERY.md) — 7 perguntas de Aggregate Design
- [knowledge/architecture/governance/ARCHITECTURE_GOVERNANCE.md](../knowledge/architecture/governance/ARCHITECTURE_GOVERNANCE.md) — princípios aplicados nesta decisão ("Evidence Before Freeze", "Architecture First")
- [knowledge/engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md](../knowledge/engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md) — processo obrigatório citado nas Implementation Transition Rules
- [services/kernel/KERNEL_BOUNDARY_REVIEW.md](../services/kernel/KERNEL_BOUNDARY_REVIEW.md) — classificação Domain/Infrastructure, base do Freeze Scope
