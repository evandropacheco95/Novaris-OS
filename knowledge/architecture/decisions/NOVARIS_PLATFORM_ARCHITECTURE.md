# NOVARIS — Platform Architecture Consolidation

Versão: 1.9.0

Status: 🟡 ARCHITECTURE PARTIALLY FROZEN

Missão: ENG-0017 (NOVARIS Platform Architecture Constitution) — Architecture Freeze Mission; atualizado por ENG-0020 (Queue Ownership Resolution), ENG-0022 (Automation Domain Confirmation), ENG-0023 (AI Domain Confirmation), ENG-0024 (Domain Model Reconciliation), ENG-0025 (Knowledge Domain Position Resolution), ENG-0030 (Studio & Marketplace Architectural Position) e ENG-0020.2 (Queue Ownership Documentation Reconciliation) — §§ 7, 9, 10, 11, 12, 13, 14 refletem a resolução de `CRM`/`Queue`/`Automation`/`AI`/`Knowledge`/`Studio`/`Marketplace` por `ADR-0011`–`ADR-0015`, `ADR-0018`; `DOMAIN_MODEL.md` sincronizado para `CRM`/`Automation`/`AI` (ENG-0024), `Knowledge` (ENG-0026) e `Task` (ENG-0028, `ADR-0016` — zero duplicações de objeto remanescentes entre domínios ativos) — `IMPLEMENTATION_ROADMAP.md` também sincronizado por ENG-0026 (Risco R5, marco M12); `Studio`/`Marketplace` nunca tiveram seção em `DOMAIN_MODEL.md`, nada a sincronizar. **Nota (ENG-0020.2)**: linhas 91/122/141 (§§ 10-12) atualizadas para eliminar a afirmação superada "`Queue` pertence a `Automation`" como estado atual — `ADR-0013` já havia revertido essa premissa; texto original preservado como histórico, citando `ADR-0012`.

Escopo original (ENG-0017): consolidar, num único documento, tudo o que já foi decidido nas missões `ENG-0001` a `ENG-0016` sobre Produto, Domínio, Shared Kernel e Infrastructure. Nenhum código, módulo, `DOMAIN_MODEL.md`, ADR ou contrato foi alterado. Nenhum documento existente foi alterado. Nenhum produto, domínio ou pendência foi inventado ou resolvido — toda afirmação cita a fonte exata de onde vem. **Nota (ENG-0020)**: este documento foi atualizado (não recriado) para refletir uma pendência que a própria § 12 registrava, agora resolvida por decisão formal (`ADR-0011`, `ADR-0012`) — dentro da autorização explícita de `ENG-0020` para atualizar referências de ownership somente quando necessário.

**Nota de nomenclatura**: este documento consolida **arquitetura** (Produto/Domínio/Kernel/Infraestrutura) — não é, e não substitui, `knowledge/core/CONSTITUTION.md` (a Constituição normativa da plataforma, governança e regras de negócio, `ADR-0008`). O nome da missão ("Architecture Constitution") é informal; o conteúdo aqui é estritamente arquitetural.

---

## 1. Executive Summary

A plataforma NOVARIS tem hoje: **Shared Kernel estável** (`packages/shared-kernel`, 9 blocos, ~125 testes, reutilizado sem modificação por 3 domínios); **3 Domain Capabilities implementadas no Kernel** (`Identity`, `Organization`, `Audit`, cada uma com Aggregate Root, testes e Freeze formal); **1 Epic de domínio encerrado sem capacidade própria** (`Permission`, absorvido por `Identity`); **1 capacidade reclassificada de domínio para Infrastructure** (`Event Bus`); **6 Bounded Contexts de negócio em scaffolding puro** (`Customer`, `Sales`, `Marketing`, `Projects`, `Financial`, `Analytics` — zero código); **4 domínios sem Bounded Context algum** (`Activity`, `Knowledge` — bloqueado —, `AI`, `Automation` — não confirmados como Business Domain); **9 produtos comerciais, todos com especificação vazia** (`specifications/*/`, 46 linhas cada, 100% `TODO`); e **3 conflitos documentais ativos, nenhum resolvido** (existência do domínio `CRM`; ausência total de domínio para `Studio`; confirmação pendente de `AI`/`Automation` como Business Domain). **Architecture Status: `ARCHITECTURE PARTIALLY FROZEN`** (§ 13).

## 2. Platform Vision

Fonte única e oficial: `knowledge/core/NOVARIS_OS.md` (🟢 Oficial v1.0.0, `knowledge/core/README.md`). NOVARIS é uma plataforma SaaS full-stack (Next.js, Supabase/PostgreSQL, IA nativa via OpenAI/Claude/MCP, automação via n8n, deploy na Vercel — `README.md` raiz). `NOVARIS_OS.md § 7` descreve 6 produtos originais (`Growth`, `CRM`, `AI`, `Automation`, `Studio`, `SaaS`); `PRODUCTS.md` os expande para 9 (substitui `SaaS` por `Analytics`/`Projects`/`Marketplace`/`Financial` separados) — divergência já registrada, não resolvida por este documento (`DOMAIN_CANONICALIZATION.md § 3`).

## 3. Architectural Principles

- **Clean Architecture / DDD**, camadas Domain → Application → Infrastructure → Interface (`ENGINEERING_PLAYBOOK.md §§ 1-6`).
- **Um domínio nunca acessa tabelas de outro domínio** — só por Eventos ou APIs (`DOMAIN_MODEL.md § REGRAS`).
- **Toda informação pertence a uma Organization** — multi-tenancy via `organizationId`, nunca embutido (RN001-004, `objects/Organization.md`; generalizado em `AGGREGATE_IMPLEMENTATION_STANDARD.md § 7`, ENS-0001).
- **Nunca inventar regra de negócio** — toda invariante cita fonte documentada, nunca inferida na implementação (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 4`).
- Os 8+2 princípios já formalizados em `KERNEL_DOMAIN_LIFECYCLE_V2.md § 2`: Architecture First, Shared Kernel First, No Infrastructure Before Domain, No Hidden Decisions, ADR Before Divergence, Single Source of Truth, Traceability First, Implementation Only After Approval, Verify Before Reimplementing, Mission ID Uniqueness.

## 4. Documentation Precedence

Decisão formal do CTO (`CONTEXT_RELATIONSHIPS.md`, `ENG-0011`, item 2), reproduzida sem alteração:

```
ADRs
  ↓
DOMAIN_MODEL.md
  ↓
ENGINEERING_PLAYBOOK.md
  ↓
PROJECT_RULES.md
  ↓
SYSTEM_ARCHITECTURE.md
  ↓
READMEs
  ↓
Demais documentos estratégicos (NOVARIS_OS.md, PRODUCTS.md, ORGANIZATION.md)
```

## 5. Platform Layers

Formalizado por `ADR-0007`: **Product Layer** (`PRODUCTS.md` — "o que a NOVARIS vende ao cliente... nunca uma fronteira de dados") e **Domain Layer** (`DOMAIN_MODEL.md` — bounded contexts técnicos DDD, fronteira de dados e responsabilidade). Um produto é entregue por 1+ domínios, nunca é ele mesmo um domínio (`ADR-0007 § Contexto`). Abaixo do Domain Layer: **Kernel** (Domain Capabilities + Infrastructure Capabilities, `services/kernel/`, separado dos Business Domains por `ADR-0006`) e, na base, o **Shared Kernel** (`packages/shared-kernel`).

## 6. Product Architecture

9 produtos (`PRODUCTS.md`), nenhum com especificação real (`PRODUCT_DOMAIN_ARCHITECTURE.md § 2`, ENG-0016 — 46 linhas totais cada, 9 de 10 arquivos `TODO`). Composição de domínio por produto, quando conhecida (`PRODUCT_DOMAIN_ARCHITECTURE.md §§ 4-5`):

| Produto | Domínio(s) | Fonte |
|---|---|---|
| `Growth` | `Sales` + `Customer` + `Marketing` + `Analytics` (composição, sem domínio próprio) | `ADR-0007` |
| `CRM` | `Customer` + `Sales` + `Activity` (composição, sem domínio próprio) | `DOMAIN_MODEL.md`, confirmado por `CRM_DOMAIN_DISCOVERY.md` (ENG-0015) |
| `AI` | Domínio `AI` — **não confirmado como Business Domain** | `ENG-0011` item 6 |
| `Automation` | Domínio `Automation` — **não confirmado como Business Domain** | `ENG-0011` item 6 |
| `Studio` | **Nenhum domínio, nem composição** | `ADR-0007`: "Studio não é [domínio]" |
| `Analytics` | `Analytics` (mesmo nome) | `DOMAIN_MODEL.md` |
| `Projects` | `Project`/`Projects` (mesmo nome) | `DOMAIN_MODEL.md` |
| `Marketplace` | Domínio "ainda não criado" | `ADR-0007` |
| `Financial` | `Financial` (mesmo nome) | `DOMAIN_MODEL.md` |

## 7. Domain Architecture

13 domínios (`DOMAIN_MODEL.md`, canônico por decisão do CTO, `ENG-0011` item 1):

| Domínio | Status | Fonte |
|---|---|---|
| `Identity` | 🟢 Implementado | `IDENTITY_DOMAIN_CLOSURE.md`, re-confirmado em `IDENTITY_DESIGN_FREEZE.md` (ENG-0014) |
| `Organization` (`Workspace` legado) | 🟢 Implementado | `ORGANIZATION_FINAL_ARCHITECTURE_REVIEW.md` |
| `Customer` (`Relationship`) | 🟡 Scaffolding | `services/domains/customer/`, `ADR-0007` |
| `Sales` | 🟡 Scaffolding | `services/domains/sales/` |
| `Activity` | ⚪ Sem Bounded Context | `DOMAIN_CONTEXT_MAP.md § 2` |
| `Projects` | 🟡 Scaffolding | `services/domains/projects/`; posse de `Task` (`ENG-0011` item 8) |
| `Marketing` | 🟡 Scaffolding | `services/domains/marketing/` |
| `Knowledge` | 🔵 Absorvido pela AI Transversal Intelligence Layer (`ADR-0015`, ENG-0025) — não mais bloqueado | `ADR-0015`, resolvendo `IMPLEMENTATION_ROADMAP.md § 6`, Risco R5 |
| `AI` | ⚪ Não confirmado como Business Domain | `ENG-0011` item 6 |
| `Automation` | ⚪ Não confirmado como Business Domain | `ENG-0011` item 6 |
| `Financial` | 🟡 Scaffolding | `services/domains/financial/`; posse de `Subscription` (`ENG-0011` item 7) |
| `Analytics` | 🟡 Scaffolding, Supporting Domain | `services/domains/analytics/`; `ENG-0011` item 5 |
| `System` (fragmento: `Audit`) | 🟡 Parcialmente implementado | `AUDIT_FINAL_ARCHITECTURE_REVIEW.md` |

`Platform/Engineering` — nomeado só por posse de objeto (`Release`, `ENG-0011` item 10), sem Bounded Context, sem posição na cadeia — não é domínio de `DOMAIN_MODEL.md`. `CRM` removido desta frase (ENG-0020): confirmado exclusivamente Product Layer por `ADR-0011`, nunca foi nem será domínio. **Atualizado (ENG-0020.2)**: `Queue` (antes atribuído a `CRM`, depois a `Automation` por `ADR-0012`) **não possui Domain Owner hoje** — `ADR-0013` confirmou `Automation` como Infrastructure Capability, não Business Domain, invalidando a premissa de `ADR-0012`; `Queue` é Infrastructure Capability transversal, histórico preservado em `ADR-0012`.

## 8. Shared Kernel

`packages/shared-kernel/` (`@novaris/shared-kernel`) — 9 blocos implementados e testados (`UniqueEntityId`/`Entity`/`ValueObject`/`AggregateRoot`, `Result`/`Either`/`Option`, hierarquia de erros, `DomainEvent`, Specification Pattern, `Repository`/`ReadRepository`/`WriteRepository`, `DomainService`/`AsyncDomainService`, contratos estruturais `HasIdentity`/`Timestamped`/`Versionable`/`HasMetadata`/`Auditable`). Reutilizado sem modificação por `Identity`, `Organization`, `Audit` — 3ª confirmação empírica do padrão (`AUDIT_FINAL_ARCHITECTURE_REVIEW.md § 8`).

## 9. Infrastructure Capabilities

Classificação completa e verificada por inspeção real: `KERNEL_BOUNDARY_REVIEW.md` (ENG-0007). Confirmadas por fonte direta: `event-bus` ("Messaging", `ENGINEERING_PLAYBOOK.md § 5`; também confirmado por Discovery formal, `EVENT_BUS_DISCOVERY.md`/`EVENT_BUS_EPIC_CLOSURE.md`), `logging`, `storage`, `integration-hub`; **`automation-runtime`, também confirmado por Discovery formal (`ADR-0013`, ENG-0022)**. `ai-runtime` é a camada de execução (Infrastructure Capability confirmada) de uma estrutura maior — **`AI` como um todo é uma Transversal Intelligence Layer** (definição em `packages/ai/` + execução em `ai-runtime` + governança em `CONSTITUTION.md Artigo 13`), confirmada por Discovery formal (`ADR-0014`, ENG-0023), categoria distinta de Infrastructure Capability pura. Por inferência estrutural consistente, sem Discovery própria: `files`, `notifications`, `realtime`, `search`, `monitoring`, `scheduler`. **`configuration`/`feature-flags`: "Discovery Required"** — candidatos a Domain Capability genuína (RN007, `objects/Organization.md`), não classificados como Infrastructure sem investigação própria (`KERNEL_BOUNDARY_REVIEW.md § 5`).

## 10. Dependency Rules

- Cadeia de dependência de `DOMAIN_MODEL.md § DEPENDÊNCIAS`: `Identity → Organization → Customer → Sales → Activity → Projects → Marketing → Financial → Analytics → System` — atualizada por `ENG-0026`, removendo também `Knowledge` (já sem `AI`/`Automation` desde `ENG-0024`) — nenhum domínio depende de um domínio posterior.
- Toda referência entre Aggregates é por `UniqueEntityId`, nunca por objeto embutido — sem exceção confirmada nos 3 contextos implementados (`KERNEL_BOUNDARY_REVIEW.md § 3`).
- `Identity` e `Organization` são Open Host Services (`CONTEXT_RELATIONSHIPS.md § 5`) — todo domínio pode depender deles, nenhum pode ser embutido.
- `Audit` é Anti-Corruption Layer sobre `Identity`/`Organization` — nunca importa tipos concretos (`AUDIT_BOUNDED_CONTEXT.md § 9`).

## 11. Decision Matrix

Consolidação das decisões formais já tomadas nesta engenharia (nenhuma nova aqui):

| Decisão | Fonte |
|---|---|
| `DOMAIN_MODEL.md` é canônico para Domain Layer | `ENG-0011` item 1 |
| Ordem de precedência documental (§ 4) | `ENG-0011` item 2 |
| `Organization` é o nome canônico (não `Workspace`) | `ENG-0011` item 3 |
| `Workspace` é nomenclatura legada, só interna a `Organization` | `ENG-0011` item 4 |
| `Analytics` é Supporting Domain | `ENG-0011` item 5 |
| `AI`/`Automation` não são Business Domains hoje | `ENG-0011` item 6 |
| `Subscription` pertence a `Financial` | `ENG-0011` item 7 |
| `Task` pertence a `Projects`, consumido por referência de id por `Activity`/`Sales`/IA | `ENG-0011` item 8, formalizado por `ADR-0016` (ENG-0027) |
| `Queue` não possui Domain Owner — Infrastructure Capability transversal (**atualizado ENG-0020.2**; decisão intermediária original de `ADR-0012`/ENG-0020, "`Queue` pertence a `Automation`", revisando `ENG-0011` item 9 após `ADR-0011`/ENG-0019 invalidar `CRM`, preservada como histórico em `ADR-0012`) | `ADR-0013` (ENG-0022), ver linha "Automation" abaixo |
| `Studio` é Product Layer, composto por `Marketing`+`Analytics`+futuro motor de construção (Platform Capability) | `ADR-0018` (ENG-0030) |
| `Marketplace` é Product Layer, composto por `integration-hub`+`Organization`/`configuration` (Kernel Capabilities) | `ADR-0018` (ENG-0030) |
| `Release` pertence a `Platform/Engineering` | `ENG-0011` item 10 |
| `Knowledge` absorvido pela AI Transversal Intelligence Layer, não modelado como domínio próprio | `ADR-0015` (ENG-0025), resolvendo `ENG-0011` item 11 |
| `Permission` é Value Object dentro de `Identity`, sem capacidade própria | `PERMISSION_EPIC_CLOSURE.md`, EPIC-004 |
| `Event Bus` é Infrastructure Capability, não domínio | `EVENT_BUS_EPIC_CLOSURE.md`, EPIC-006 |
| Constituição ativa: `CONSTITUTION.md` (não `NOVARIS_CONSTITUTION.md`) | `ADR-0008` |
| NEF é referência estrutural; Handbook é onboarding linear; NES é histórico | `ADR-0009` |
| Estratégia de credencial de Identity (hash, `PasswordVerifier`) | `ADR-0010` |
| `status` de `Organization` = 5 valores fixos | `ADR-ORG-001` |
| `CRM` é exclusivamente Product Layer, sem Bounded Context próprio | `ADR-0011` (ENG-0019) |
| `Automation` é Platform Capability, não Business Domain; `Queue` e os demais 6 objetos de `Automation` não têm Owner de Domain Layer | `ADR-0013` (ENG-0022), resolvendo a pendência de `ADR-0012` |
| `AI` é Transversal Intelligence Layer, não Business Domain; seus 9 objetos não têm Owner de Domain Layer | `ADR-0014` (ENG-0023), encerrando `ENG-0011` item 6 integralmente |

## 12. Official Pending Decisions

Consolidação, sem resolver nenhuma, de todas as pendências já registradas nas 8 missões de `EPIC-007` — exceto a primeira, já resolvida por missões subsequentes e mantida aqui só para rastreabilidade:

- ~~**Existência do domínio `CRM`**~~ — **Resolvido por `ADR-0011` (ENG-0019)**: `CRM` é exclusivamente Product Layer, nunca Bounded Context. Consequência intermediária de `ADR-0012` (ENG-0020): `Queue` (antes atribuído a `CRM` por `ENG-0011` item 9) foi reatribuído a `Automation`. **Atualizado (ENG-0020.2)**: `ADR-0013` (ENG-0022) posteriormente confirmou `Automation` como Infrastructure Capability, não Business Domain — `Queue` **não possui Domain Owner hoje**, é Infrastructure Capability transversal; decisão intermediária preservada como histórico em `ADR-0012`.
- ~~**Composição de domínio de `Studio`**~~ — **Resolvido por `ADR-0018` (ENG-0030)**: Product Layer, composto por `Marketing`(`Landing Page`) + `Analytics`(`Dashboard`) + futuro motor de construção (Platform Capability, ainda não implementado).
- ~~**Confirmação de `AI`/`Automation` como Business Domain**~~ — **Totalmente resolvido**: `Automation` por `ADR-0013` (ENG-0022, Platform Capability); `AI` por `ADR-0014` (ENG-0023, Transversal Intelligence Layer). `ENG-0011` item 6 encerrado integralmente.
- ~~**Domínio de `Marketplace`**~~ — **Resolvido por `ADR-0018` (ENG-0030)**: Product Layer, composto por `integration-hub` + `Organization`/`configuration` (Kernel Capabilities) — não é, e a nota especulativa de "futuro domínio" de `ADR-0007` foi substituída em autoridade por esta ADR.
- ~~**Bloqueio de `Knowledge`**~~ — **Resolvido por `ADR-0015` (ENG-0025)**: absorvido pela AI Transversal Intelligence Layer. `IMPLEMENTATION_ROADMAP.md § 6`, Risco R5 não atualizado (fora de escopo de `ENG-0025`) — achado registrado.
- **23 conceitos com `Ownership Pending CTO Decision`** (`DOMAIN_OWNERSHIP.md § 7`, recontado nesta missão — correção de um erro aritmético acumulado nas 3 missões anteriores, ver nota em `DOMAIN_OWNERSHIP.md § 7`) — `Session`/`IdentityProvider`/`Token` de Identity (3), `Team`/`Plan`/`Workspace` de Organization (3), 7 objetos de "System", 10 objetos de `BOM.md` sem domínio. `AI` (9), `Automation` (7) e `Knowledge` (6) já removidos por `ADR-0014`/`ADR-0013`/`ADR-0015`.
- **7 perguntas de Aggregate Design** (`AGGREGATE_DISCOVERY.md § 4`) — `Party` vs. `Person`/`External Organization`; `Task` como Entity ou Aggregate; `Widget` como Entity ou Aggregate; `Invoice` vs. `Subscription` como um ou dois Aggregates; e toda Discovery formal de `Sales`/`Customer`/`Marketing`/`Projects`/`Financial`/`Analytics`/`Activity`.
- **Reconciliação das 6 listas de domínio/produto** — `NOVARIS_OS.md §§ 7, 12`, `PRODUCTS.md`, `ORGANIZATION.md`, `SYSTEM_ARCHITECTURE.md § 5`, `DOMAIN_MODEL.md` (`DOMAIN_CANONICALIZATION.md § 8`).
- **`configuration`/`feature-flags`** — "Discovery Required", risco de conterem regra de negócio genuína de `Organization` (RN007).
- **`users`/`roles`** (scaffolding do Kernel) — mesma sobreposição que `permissions` tinha antes do `EPIC-004`, nunca formalmente encerrada (`KERNEL_BOUNDARY_REVIEW.md § 6`).
- **ADR do mecanismo de enriquecimento** de `Audit` (`AUDIT_DOMAIN_DECISIONS.md § 5`) — recomendada, nunca criada.
- **Payload ausente em `DomainEvent`** (Shared Kernel) — nenhum evento já implementado carrega dado de negócio (`EVENT_BUS_EPIC_PLANNING.md § 7`).

## 13. Architecture Freeze Status

# ARCHITECTURE PARTIALLY FROZEN

**Justificativa**: **congelado** — Shared Kernel (9 blocos, 3 confirmações empíricas); os 3 Domain Capabilities do Kernel (`Identity`, `Organization`, `Audit`), cada um com Freeze tático próprio; a distinção Product/Domain Layer (`ADR-0007`); a ordem de precedência documental (§ 4); a classificação Domain/Infrastructure do Kernel (`KERNEL_BOUNDARY_REVIEW.md`, exceto `configuration`/`feature-flags`); as regras de dependência (§ 10); a posição de `CRM` como Product Layer, o Owner de `Queue`, a confirmação de `Automation` como Platform Capability, a confirmação de `AI` como Transversal Intelligence Layer, a absorção de `Knowledge` na mesma camada, e a posição de `Studio`/`Marketplace` como Product Layer (`ADR-0011`–`ADR-0015`, `ADR-0018` — resolvidos após este documento, atualizado por ENG-0020, ENG-0022, ENG-0023, ENG-0025 e ENG-0030; `ENG-0011` itens 6 e 11 encerrados integralmente). **Não congelado** — 23 conceitos de ownership; 7 perguntas de Aggregate Design; a reconciliação das 6 listas de domínio/produto — todos listados em § 12, nenhum resolvido por este documento. `ARCHITECTURE FROZEN` (opção A) exigiria que nenhum item de § 12 existisse — ainda não é o caso, mesmo após a resolução de `CRM`/`Queue`/`Automation`/`AI`/`Knowledge`/`Studio`/`Marketplace`. **Ratificado formalmente por `ADR-0019` (ENG-0031)**: declarado `ARCHITECTURE FROZEN WITH DOCUMENTED EXCEPTIONS` — a camada macro/estratégica (listada acima como "congelado") está estável o suficiente para autorizar o início da fase de implementação de domínio; os itens de § 12 são tratados como exceções documentadas e não-bloqueantes, resolvíveis uma a uma durante a implementação, não como impedimento ao seu início.

## 14. Future Evolution Guidelines

Recomendado, não decidido:

1. ~~Resolver o conflito de `CRM` antes de qualquer implementação que o cite como domínio.~~ **Concluído — `ADR-0011` (ENG-0019), `ADR-0012` (ENG-0020).**
2. ~~Confirmar ou negar `AI`/`Automation` como Business Domain~~ — **Concluído integralmente**: `Automation` (`ADR-0013`, ENG-0022) é Platform Capability; `AI` (`ADR-0014`, ENG-0023) é Transversal Intelligence Layer. Nenhum dos dois é Business Domain.
3. ~~Definir a composição de `Studio` (mesmo padrão já usado para `Growth`/`CRM`) ou confirmar que não tem nenhuma.~~ **Concluído — `ADR-0018` (ENG-0030).** `Marketplace` também resolvido na mesma ADR.
4. Seguir `KERNEL_DOMAIN_LIFECYCLE_V2.md` integralmente para cada novo domínio, incluindo a checagem de unicidade de Mission ID (lição já aprendida em `ENG-0000.5`).
5. Priorizar a Discovery de `Sales` como próximo candidato a Bounded Context real — critério estrutural já mais forte que os demais (`AGGREGATE_DISCOVERY.md`, `Opportunity` como candidato com maior evidência).

## 15. Architecture Governance

Processo já em vigor, reafirmado, não alterado: taxonomia de Mission ID (`ADR-`/`ADM-`/`ENS-`/`ENG-`, `NEF/PLANNING_MODEL.md`); relatórios obrigatórios por tipo de missão (Self Review sempre; DMV para modelagem de domínio; ACR desde `ENG-0002.A`; ARG — 12 critérios, `ARCHITECTURE_REVIEW_GATE_STANDARD.md`, ENS-0002 — para toda missão `ENG-` de implementação); Link Checker obrigatório após todo lote de mudanças; `KERNEL_DOMAIN_LIFECYCLE_V2.md` como processo oficial de todo novo domínio; Matriz de Autoridade Documental (`PROJECT_RULES.md § Artigo 1`) para qualquer dúvida sobre fonte canônica de um assunto de governança (distinto da precedência arquitetural de § 4 deste documento, que é específica de Produto/Domínio/Kernel).

---

## Validações

- **Link Checker** (`-Root` explícito): ver ENG-0017 FINAL REPORT.
- **ARG (ENS-0002)**: N/A nos critérios de código; PASS nos demais.
- **Domain Model Validation**: nenhuma Entity/Aggregate/Value Object/Domain Event criado; nenhum produto ou domínio inventado; toda pendência de § 12 reafirmada, nenhuma resolvida; nenhuma decisão anterior alterada.

## Relação com Outros Módulos

- Todos os documentos de `knowledge/architecture/` e `knowledge/architecture/decisions/` (`ENG-0009` a `ENG-0016`) — consolidados aqui, nenhum substituído
- [adr/ADR-0007](../../../adr/ADR-0007-domain-boundaries.md), [ADR-0008](../../../adr/ADR-0008-foundation-freeze.md), [ADR-0009](../../../adr/ADR-0009-engineering-entry-point-authority.md), [ADR-0010](../../../adr/ADR-0010-authentication-credential-strategy.md), [ADR-ORG-001](../../../adr/ADR-ORG-001-organization-status-strategy.md)
- [KERNEL_DOMAIN_LIFECYCLE_V2.md](../../engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md), [KERNEL_MATURITY_ASSESSMENT.md](../../engineering/standards/KERNEL_MATURITY_ASSESSMENT.md)
- [PROJECT_RULES.md](../../../PROJECT_RULES.md) § Matriz de Autoridade Documental

## Status

🟡 **ARCHITECTURE PARTIALLY FROZEN** (Missão ENG-0017). Nenhum código, módulo, `DOMAIN_MODEL.md`, ADR ou documento existente alterado. Todas as pendências de `EPIC-007` preservadas e consolidadas, nenhuma resolvida.
