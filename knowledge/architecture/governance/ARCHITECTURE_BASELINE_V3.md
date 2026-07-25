# Architecture Baseline V3

Versão: 1.0.0

Missão: ENG-0022.2 (Repository Governance Consolidation & Architecture Baseline V3)

**Verify Before Reimplementing**: busca por "ARCHITECTURE_BASELINE_V3", "Architecture Baseline V3" em todo o repositório — zero resultados. Nenhuma duplicação. Nenhuma colisão de Mission-ID detectada para `ENG-0022.2` — esta é, aliás, a numeração que a própria reconciliação anterior (`ARCHITECTURE_STATE_RECONCILIATION.md`, `ENG-0022.1`) recomendou para esta exata missão.

---

## Status

🟢 Baseline de governança consolidada — documentação apenas. Nenhum código, Entity, Aggregate, Value Object, regra de negócio, ADR, `DOMAIN_MODEL.md` ou `DOMAIN_OWNERSHIP.md` criado/alterado/movido/renomeado/removido.

## Executive Summary

A cadeia `ADR-0007 → ADR-0011 → ADR-0012+Amendment → ADR-0013 → ADR-0014 → RELATIONSHIP_DOMAIN_DISCOVERY.md (ENG-0022) → ARCHITECTURE_STATE_RECONCILIATION.md (ENG-0022.1)` já resolveu, com evidência rastreável, a classificação de todo conceito arquitetural relevante hoje em disputa: `Relationship`/`Customer` (mesmo Business Domain, dois nomes de camada), `CRM` (Product Capability Layer), `Automation`/`Queue` (Infrastructure Capability), `AI`/`Intelligence` (Transversal Capability), `Communication` (Not Confirmed). Esta missão não descobre nada novo — consolida essa cadeia num único documento de baseline, audita a estrutura de pastas (`analysis/` vs. `discovery/`) e a disciplina de numeração de missões (2 colisões já ocorridas nesta mesma cadeia: `ENG-0020`, `ENG-0022`), e avalia se o repositório está pronto para `Aggregate Design`. **Conclusão de prontidão**: SIM, com 5 itens não-bloqueantes pendentes de decisão do CTO (§ "CTO Decisions Required") — nenhum deles impede tecnicamente o início do Aggregate Design de `Relationship`/`Customer`.

## Repository Governance Assessment

A governança documental da NOVARIS já é extensa e, em sua maioria, rigorosa: 23 ADRs sequenciais (`adr/`), um framework de princípios nomeados (`governance/ARCHITECTURE_GOVERNANCE.md`, 10+ princípios, incluindo "Mission ID Uniqueness"), um processo de Discovery→Decision já demonstrado 6 vezes (`Permission`, `Event Bus`, `CRM`, `Automation`, `AI`, `Relationship`). As falhas encontradas não são de rigor de conteúdo — são de **execução mecânica de verificação**: o princípio "Mission ID Uniqueness" já existe desde `ENG-0000.5`, mas nenhuma missão (incluindo `ENG-0020` e `ENG-0022` desta mesma sessão) teve como verificá-lo além de busca textual manual — não existe um registro/índice único e consultável de todos os Mission-IDs já usados. Da mesma forma, a estrutura de pastas de Discovery se fragmentou (`analysis/` vs. `discovery/`) sem que nenhuma missão tenha percebido a duplicação de escopo antes da anterior a esta.

## Official Architecture Inventory

### Kernel

| Conceito | Status | Evidência |
|---|---|---|
| `Identity` | 🟢 Implementado (29 arquivos `.ts`) | `services/kernel/identity/` |
| `Organization` (Workspace) | 🟢 Implementado (6 arquivos `.ts`) | `services/kernel/organizations/` |
| `Audit` | 🟢 Implementado (3 arquivos `.ts`) | `services/kernel/audit/` |
| `Permission` | 🟡 Value Object dentro de `Identity`, sem capacidade própria | `PERMISSION_EPIC_CLOSURE.md`, EPIC-004 |
| `Event Bus` | 🟡 Infrastructure Capability, não domínio | `EVENT_BUS_EPIC_CLOSURE.md`, EPIC-006; `services/kernel/event-bus/` (0 arquivos `.ts`, scaffolding) |
| Demais Kernel Capabilities (`configuration`, `feature-flags`, `files`, `integration-hub`, `logging`, `monitoring`, `notifications`, `permissions`, `realtime`, `roles`, `scheduler`, `search`, `storage`, `users`) | 🚧 Scaffolding (0 arquivos `.ts` cada) | Inspeção direta |

### Business Domains

| Conceito | Status | Implementação | Evidência |
|---|---|---|---|
| `Relationship` (= `Customer`) | 🟢 Confirmed | 🚧 Scaffolding (`services/domains/customer/`, 0 `.ts`) | `DOMAIN_MODEL.md § RELATIONSHIP DOMAIN`; `RELATIONSHIP_DOMAIN_DISCOVERY.md` |
| `Sales` | 🟢 Confirmed | 🟢 Implementado (60 arquivos `.ts` — Domain/Application/Contracts/Tests, Freeze V2 declarado) | `DOMAIN_MODEL.md § SALES DOMAIN`; `SALES_CONTRACTS_FREEZE_V2.md` |
| `Analytics` | 🟢 Confirmed | 🚧 Scaffolding (`services/domains/analytics/`, 0 `.ts`) | `DOMAIN_MODEL.md § ANALYTICS DOMAIN` |
| `Activity` | 🟢 Confirmed (`DOMAIN_MODEL.md`) | 🚧 Sem pasta própria em `services/domains/` | `DOMAIN_MODEL.md § ACTIVITY DOMAIN` |
| `Project` | 🟢 Confirmed | 🚧 Scaffolding (`services/domains/projects/`, 0 `.ts`) | `DOMAIN_MODEL.md § PROJECT DOMAIN` |
| `Marketing` | 🟢 Confirmed | 🚧 Scaffolding (`services/domains/marketing/`, 0 `.ts`) | `DOMAIN_MODEL.md § MARKETING DOMAIN` |
| `Financial` | 🟢 Confirmed | 🚧 Scaffolding (`services/domains/financial/`, 0 `.ts`) | `DOMAIN_MODEL.md § FINANCIAL DOMAIN` |
| `System` | 🟢 Confirmed (fragmento: `Audit`) | 🟡 Parcial (`Audit` implementado como fragmento) | `DOMAIN_MODEL.md § SYSTEM DOMAIN` |
| `Identity`, `Workspace` (Organization) | 🟢 Confirmed | 🟢 Implementado | `DOMAIN_MODEL.md §§ IDENTITY/WORKSPACE DOMAIN` |

### Capability Layers

| Conceito | Status | Evidência |
|---|---|---|
| `CRM` | Product Capability Layer | `ADR-0011` — composição de `Customer`+`Sales`+`Activity`, nunca Bounded Context |
| `Studio` | Product Capability Layer | `ADR-0018` — composição de `Marketing`+`Analytics`+futuro motor |
| `Marketplace` | Product Capability Layer | `ADR-0018` — composição de `integration-hub`+`Organization`/`configuration` |

### Infrastructure Capabilities

| Conceito | Status | Evidência |
|---|---|---|
| `Automation` | Platform/Infrastructure Capability | `ADR-0013` — `services/kernel/automation-runtime/` (0 `.ts`, scaffolding) |
| `Queue` | Infrastructure Capability, transversal, sem Domain Owner | `ADR-0012` + Amendment (`ADR-0013`) |
| `Event Bus` | Infrastructure Capability | `EVENT_BUS_EPIC_CLOSURE.md`, EPIC-006 |

### Cross-cutting Capabilities

| Conceito | Status | Evidência |
|---|---|---|
| `AI` (= "Intelligence") | Transversal Intelligence Layer — não Business Domain, não Capability Layer simples | `ADR-0014` — `packages/ai/` + `services/kernel/ai-runtime/` (0 `.ts`) + `CONSTITUTION.md Artigo 13` |

### Historical Concepts

| Conceito | Status | Evidência |
|---|---|---|
| `AI DOMAIN` (seção original de `DOMAIN_MODEL.md`) | Removida da lista ativa, texto preservado como histórico | `ADR-0014` |
| `AUTOMATION DOMAIN` (idem) | Removida da lista ativa, texto preservado como histórico | `ADR-0013` |
| `KNOWLEDGE DOMAIN` (idem) | Removida da lista ativa, absorvida pela AI Transversal Intelligence Layer | `ADR-0015` |
| `Queue` atribuído a `CRM` (decisão original `ENG-0011` item 9) | Superada, preservada como histórico em `ADR-0012` | `ADR-0011`, `ADR-0012` |
| `growth` como bounded context técnico | Removido (nunca foi domínio, era Product Layer) | `ADR-0007` |

**Not Confirmed**: `Communication` — nenhuma evidência em `DOMAIN_MODEL.md`, `UBIQUITOUS_LANGUAGE.md`, `DOMAIN_OWNERSHIP.md`, `AGGREGATE_DISCOVERY.md`, nenhuma ADR, nenhuma pasta em `services/domains/`. Não removida de nenhum documento por esta missão — apenas classificada.

## Canonical Vocabulary

| Conceito | Nome de Negócio | Nome Técnico | Localização no Repositório | Status Atual |
|---|---|---|---|---|
| `Relationship` | `Relationship` | `customer` | `services/domains/customer/` | Business Domain, Confirmed, scaffolding |
| `Customer` | *(mesmo que `Relationship`)* | `customer` | `services/domains/customer/` | Não é um segundo domínio — mesmo conceito |
| `CRM` | `CRM` | *(nenhum — nunca ganhou pasta técnica)* | N/A | Product Capability Layer |
| `Automation` | `Automation` | `automation-runtime` | `services/kernel/automation-runtime/` | Platform/Infrastructure Capability |
| `Queue` | `Queue` | *(nenhum — não implementado)* | N/A | Infrastructure Capability, sem Domain Owner |
| `AI` | `AI` | `ai-runtime` / `packages/ai/` | `services/kernel/ai-runtime/`, `packages/ai/` | Transversal Intelligence Layer |
| `Intelligence` | *(mesmo que `AI`)* | `ai-runtime` | `services/kernel/ai-runtime/` | Não é um conceito separado de `AI` |
| `Sales` | `Sales` | `sales` | `services/domains/sales/` | Business Domain, Confirmed, implementado (Domain/Application/Contracts Freeze V2) |
| `Analytics` | `Analytics` | `analytics` | `services/domains/analytics/` | Business Domain, Confirmed, scaffolding |
| `Identity` | `Identity` | `identity` | `services/kernel/identity/` | Kernel, implementado |
| `Organization` | `Organization` (canônico) / `Workspace` (legado) | `organizations` | `services/kernel/organizations/` | Kernel, implementado |
| `System` | `System` | N/A (fragmento `Audit` implementado) | `services/kernel/audit/` | Business Domain, parcial |

## Repository Organization

| Pasta | Uso Atual | Escopo Declarado (`README.md` da própria pasta) | Consistência |
|---|---|---|---|
| `knowledge/architecture/analysis/` | Discoveries/investigações de evidência (`SALES_DOMAIN_DISCOVERY.md`, `CRM_DOMAIN_DISCOVERY.md`, Audits/Alignment Decisions do Sales Contracts) | "Investigações de evidência documental, executadas antes de qualquer Design Freeze... Investigação de existência/evidência de um domínio ou conceito em disputa" | ✅ Consistente com seu próprio escopo declarado |
| `knowledge/architecture/discovery/` | 2 documentos (`RELATIONSHIP_DOMAIN_DISCOVERY.md`, `ARCHITECTURE_STATE_RECONCILIATION.md`) | **Nenhum** — pasta não existe no inventário de `knowledge/architecture/README.md § Scope`, nem em `governance/README.md § Scope` (que atribui explicitamente "Investigações de evidência" a `../analysis/`) | ❌ **Duplicação de escopo não documentada** — mesmo propósito de `analysis/`, sem ADR ou justificativa própria criando a nova pasta |
| `knowledge/architecture/decisions/` | Decisões formais (`DOMAIN_OWNERSHIP.md`, `NOVARIS_PLATFORM_ARCHITECTURE.md`, `AGGREGATE_DISCOVERY.md`, `ADR-0011`) | "Decisões formais de arquitetura de domínio/produto" | ✅ Consistente, com achado pré-existente já registrado (localização de `ADR-0011` aqui em vez de `adr/`, fora de escopo desta missão) |
| `knowledge/architecture/governance/` | Framework de princípios (`ARCHITECTURE_GOVERNANCE.md`) + este Baseline | "Framework de governança arquitetural forward-looking" | ✅ Consistente |
| `adr/` | 22 dos 23 ADRs (todos exceto `ADR-0011`) | "Registro sequencial e imutável de ADRs da plataforma" | 🟡 Consistente em conteúdo, com a exceção `ADR-0011` já registrada em auditorias anteriores, não corrigida (fora de escopo) |

**Recomendação (não executada — proibido mover/renomear arquivos)**: consolidar `knowledge/architecture/discovery/` em `knowledge/architecture/analysis/` numa futura missão explicitamente autorizada a mover arquivos, preservando link integrity (Link Checker obrigatório antes/depois).

## Documentation Governance

A cadeia de precedência documental (`ADRs → DOMAIN_MODEL.md → ENGINEERING_PLAYBOOK.md → PROJECT_RULES.md → SYSTEM_ARCHITECTURE.md → READMEs → demais documentos estratégicos`, `ENG-0011` item 2, reafirmada em `NOVARIS_PLATFORM_ARCHITECTURE.md § 4` e `knowledge/architecture/README.md § Relationship`) permanece a única ordem de autoridade vigente — nenhuma missão desta cadeia a contradisse. As 3 inconsistências documentais encontradas e corrigidas por `ENG-0020.2` (readonly ausente não se aplica aqui, era Contracts; refiro-me a `Queue` em `NOVARIS_PLATFORM_ARCHITECTURE.md`/`CONTEXT_RELATIONSHIPS.md`) já foram reconciliadas com Amendment, preservando histórico — modelo a repetir para qualquer inconsistência futura, nunca reescrever silenciosamente.

## Mission Governance

**Colisões já ocorridas nesta única cadeia de missões** (evidência de que o princípio "Mission ID Uniqueness", já existente desde `ENG-0000.5`, não é mecanicamente verificável hoje):
- `ENG-0020` — reutilizado para "Repository Architecture Synchronization" quando já pertencia a "Queue Ownership Resolution" (`ADR-0012`).
- `ENG-0022` — reutilizado para "Relationship Domain Discovery & Foundation" quando já pertencia a "Automation Domain Confirmation" (`ADR-0013`).
- `ENG-0022.1` — usado 2 vezes na mesma mensagem do CTO para propósitos diferentes (rótulo narrativo de correção vs. `PROMPT.md` real de "Architecture State Reconciliation").

**Missões fracionárias (`.1`, `.2`) já fazem parte do histórico do repositório** — confirmado por citações a `ENG-0000.1` a `ENG-0000.5` (Foundation), `ENG-0002.4` (Policies), `ENG-0003.13` (Verify Before Reimplementing) em `ARCHITECTURE_GOVERNANCE.md`, e pela própria cadeia `ENG-0022.1`/`ENG-0022.2` desta sessão. A convenção já é aceita e usada há muito tempo — não precisa ser inventada, apenas reforçada mecanicamente.

**Recomendação de modelo de governança**: um **Mission Registry** — arquivo único, append-only (ex.: `knowledge/architecture/governance/MISSION_REGISTRY.md`), listando todo Mission-ID já usado (`ENG-XXXX[.Y]`), seu título e o documento/commit onde foi executado. Toda nova missão consultaria esse arquivo antes de escrever qualquer conteúdo — substituindo a busca textual manual (`grep`) por fonte única e append-only, que teria capturado as 3 colisões acima antes de acontecerem. **Não criado por esta missão** (fora do escopo explícito: "Do NOT create... services"; um registro de missões não é código, mas não foi nomeado como entregável autorizado desta missão — registrado como recomendação para autorização futura).

## Architecture Freeze Assessment

**Pronto para Aggregate Design: SIM**, com ressalvas não-bloqueantes.

Nenhum item abaixo impede tecnicamente o início de `Relationship`/`Customer` Aggregate Design — todos são itens de governança/documentação, não de arquitetura de domínio:

- Confirmação formal (reafirmação, não nova decisão) de `Relationship`=`Customer` como um único domínio.
- Remoção/Discovery de `Communication`.
- Esclarecimento de que `Intelligence` = `AI`.
- Consolidação de `discovery/` em `analysis/`.
- Criação de um Mission Registry.

## CTO Decisions Required

1. Confirmar `Relationship`/`Customer` como um único Business Domain (nome conceitual/técnico), autorizando o Aggregate Design a prosseguir sob esse entendimento.
2. Decidir sobre `Communication`: remover de mapas ativos até Discovery formal, ou comissionar essa Discovery agora.
3. Confirmar que `Intelligence` não deve aparecer como entrada própria em nenhum documento futuro — é `AI` (`ADR-0014`).
4. Autorizar (ou não) uma missão futura para consolidar `knowledge/architecture/discovery/` em `analysis/`.
5. Autorizar (ou não) a criação de um Mission Registry formal.
6. Resolver retroativamente as colisões de numeração `ENG-0020`/`ENG-0022`/`ENG-0022.1` no índice oficial (nenhuma missão até agora teve autoridade para fazer isso sozinha).

## Recommendations

Nenhuma correção de arquitetura de domínio é necessária — a cadeia `ADR-0007`–`ADR-0014` já resolveu tudo com evidência real. As únicas ações recomendadas são de governança de processo (Mission Registry, consolidação de pastas de Discovery) e de decisão formal do CTO sobre os 6 itens acima — nenhuma delas bloqueia o avanço técnico para Aggregate Design.

## Final Baseline

## ARCHITECTURE BASELINE V3
## ESTABLISHED
## READY FOR AGGREGATE DESIGN
## (6 GOVERNANCE ITEMS PENDING CTO DECISION — NON-BLOCKING)

---

## Domain Validation

Entity created? **NO.**

Aggregate created? **NO.**

Value Object created? **NO.**

Business Rule created? **NO.**

## Architecture Validation

Bounded Context created? **NO.**

Bounded Context removed? **NO.**

ADR created? **NO** — recommendations documented only.

Repository structure modified? **NO** — nenhuma pasta criada/movida/renomeada por esta missão (a análise identifica `discovery/` como já existente desde a missão anterior, `ENG-0022.1`, não criada por esta).

Architecture decision modified? **NO.**

Code modified? **NO.**

## Relação com Outros Módulos

- [ARCHITECTURE_STATE_RECONCILIATION.md](../discovery/ARCHITECTURE_STATE_RECONCILIATION.md) (ENG-0022.1) — fonte direta desta consolidação
- [RELATIONSHIP_DOMAIN_DISCOVERY.md](../discovery/RELATIONSHIP_DOMAIN_DISCOVERY.md) (ENG-0022) — Discovery original
- [ARCHITECTURE_GOVERNANCE.md](ARCHITECTURE_GOVERNANCE.md) (ENG-0018) — framework de princípios já vigente, incluindo "Mission ID Uniqueness"
- [adr/README.md](../../../adr/README.md) — índice das 23 ADRs consultadas
- [adr/ADR-0007-domain-boundaries.md](../../../adr/ADR-0007-domain-boundaries.md), [ADR-0011](../decisions/ADR-0011-crm-domain-position.md), [ADR-0012](../../../adr/ADR-0012-queue-ownership.md), [ADR-0013](../../../adr/ADR-0013-automation-domain-confirmation.md), [ADR-0014](../../../adr/ADR-0014-ai-architectural-position.md) — cadeia de decisões consolidadas
- [knowledge/core/DOMAIN_MODEL.md](../../core/DOMAIN_MODEL.md) — fonte canônica do Domain Layer
- [SALES_CONTRACTS_FREEZE_V2.md](../analysis/SALES_CONTRACTS_FREEZE_V2.md) (ENG-0118) — único domínio hoje com implementação real e congelada, referência de maturidade

## Status

🟢 Architecture Baseline V3 estabelecida (Missão ENG-0022.2). Nenhum código, Entity, Aggregate, Value Object, regra de negócio, ADR, estrutura de repositório ou decisão de arquitetura criada/alterada/movida/renomeada/removida. Aguardando aprovação formal do CTO.
