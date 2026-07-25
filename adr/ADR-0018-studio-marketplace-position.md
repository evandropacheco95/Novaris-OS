# ADR-0018 — Studio & Marketplace Architectural Position

## Context

`ADR-0007` (Missão ENG-0000.2) já estabeleceu a distinção Product Layer vs. Domain Layer e afirmou textualmente que `Studio` "não é domínio", citando-o como precedente para produtos futuros — mas nunca definiu **quais** domínios o entregariam, nem investigou `Marketplace` com o mesmo rigor (apenas especulou, em nota, que dependeria de "`System`, `Workspace`, possivelmente um futuro domínio de `Marketplace` ainda não criado"). `PRODUCT_DOMAIN_ARCHITECTURE.md` (ENG-0016) generalizou o achado de `CRM` para os demais 8 produtos e concluiu que `Studio` é "o único produto completamente órfão de qualquer domínio, mesmo como composição" — pior situação evidencial que `Growth`/`CRM` (que já tinham composição citada). `NOVARIS_PLATFORM_ARCHITECTURE.md § 12` registra ambos como pendências oficiais desde então, nunca resolvidas. Esta ADR aplica, pela primeira vez, uma Discovery formal e separada para cada um.

## Evidence

### Studio

| Critério | Achado | Fonte |
|---|---|---|
| **Descrição funcional** | `NOVARIS_OS.md § 7`: "Landing Pages, Sites, Dashboards, Portais, Aplicações, UX, UI, Design System" — 8 itens | `NOVARIS_OS.md § 7` |
| **Especificação de produto** | `specifications/studio/` — 46 linhas totais, 9 de 10 arquivos `TODO`; `PRODUCTS.md § NOVARIS Studio` 100% `TODO` em todas as 6 subseções | Inspeção direta |
| **Sobreposição com domínio real: `Landing Page`** | `DOMAIN_MODEL.md § MARKETING DOMAIN`, "Objetos": `Campaign`, **`Landing Page`**, `Asset`, `Template`, `Content`, `Audience` — `Landing Page` já é objeto nomeado de `Marketing`, coincidindo exatamente com o primeiro item da lista de Studio | `DOMAIN_MODEL.md § MARKETING DOMAIN` |
| **Sobreposição com domínio real: `Dashboard`** | `DOMAIN_MODEL.md § ANALYTICS DOMAIN`, "Objetos": **`Dashboard`**, `Widget`, `Metric`, `Report`, `Forecast`, `Snapshot`, `Benchmark` — `Dashboard` já é objeto nomeado de `Analytics`, coincidindo com o terceiro item da lista de Studio | `DOMAIN_MODEL.md § ANALYTICS DOMAIN` |
| **Itens sem correspondência de domínio** | `Sites`, `Portais`, `Aplicações`, `UX`, `UI`, `Design System` — nenhum aparece como objeto de nenhum dos 10 Business Domains ativos (`DOMAIN_MODEL.md`, pós-`ENG-0028`) | Busca direta, confirmada nesta missão |
| **Aggregate candidato** | Nenhum — `AGGREGATE_DISCOVERY.md` não avalia `Studio` (não era domínio candidato) | `AGGREGATE_DISCOVERY.md` |
| **Precedente formal** | `ADR-0007`: "Studio não é domínio" — já confirmado, nunca contestado | `adr/ADR-0007-domain-boundaries.md` |

**Conclusão da evidência**: `Studio` não é órfão como `PRODUCT_DOMAIN_ARCHITECTURE.md` temia — **2 de seus 8 recursos já correspondem a objetos de domínios reais e ativos** (`Landing Page` → `Marketing`; `Dashboard` → `Analytics`). Os 6 recursos restantes (`Sites`, `Portais`, `Aplicações`, `UX`, `UI`, `Design System`) descrevem uma ferramenta de construção/renderização (page/app builder), não um domínio de dados de negócio.

### Marketplace

| Critério | Achado | Fonte |
|---|---|---|
| **Descrição funcional** | `NOVARIS_OS.md § 7`: "Marketplace" aparece **dentro** do produto agregador `NOVARIS SaaS`, junto de "Padronização da plataforma", "Multiempresa", "White Label", "API Pública" — nunca como produto isolado nesta fonte | `NOVARIS_OS.md § 7` |
| **Especificação de produto** | `specifications/marketplace/` — 46 linhas totais, mesma emptiness de todos os 9; `PRODUCTS.md § NOVARIS Marketplace` 100% `TODO` | Inspeção direta |
| **Natureza dos itens agrupados** | `Multiempresa`/`White Label` — capacidades de multi-tenancy, já cobertas conceitualmente por `Organization` (`organizationId` como Open Host Service universal, `CONTEXT_RELATIONSHIPS.md § 5`) e por `configuration`/`feature-flags` (Kernel, "Discovery Required", `KERNEL_BOUNDARY_REVIEW.md § 5`). `API Pública` — já mapeada como responsabilidade de `integration-hub` (Infrastructure Capability confirmada, `KERNEL_BOUNDARY_REVIEW.md`, "External APIs", `ENGINEERING_PLAYBOOK.md § 5`) | `KERNEL_BOUNDARY_REVIEW.md`, `CONTEXT_RELATIONSHIPS.md` |
| **Aggregate candidato** | Nenhum — nenhuma fonte nomeia `Listing`/`App`/`Plugin` ou qualquer Entity de catálogo de marketplace | `AGGREGATE_DISCOVERY.md` — não avaliado |
| **Precedente formal** | `ADR-0007`: "futuro domínio de `Marketplace` ainda não criado" — nota especulativa, não uma confirmação nem uma negação como a de `Studio` | `adr/ADR-0007-domain-boundaries.md` |

**Conclusão da evidência**: `Marketplace`, como descrito em toda fonte disponível, é indistinguível de uma combinação de capacidades já existentes (`integration-hub` para conectividade de terceiros, `Organization`/`configuration`/`feature-flags` para multi-tenancy/white-label) — nenhum sinal de Entity, Aggregate ou regra de negócio própria.

## Options

Avaliadas separadamente, por instrução explícita da Ordem de Missão.

### Studio

- **Option A (Business Domain)** — Rejeitada. Zero Aggregate candidato; `ADR-0007` já nega explicitamente.
- **Option B (Product Layer)** — Parcialmente correta (é, de fato, um produto de `PRODUCTS.md`), mas insuficiente isoladamente — não descreve *como* é entregue.
- **Option C (Platform Capability)** — Parcialmente correta para o núcleo de construção/renderização (`Sites`/`Portais`/`Aplicações`/`UX`/`UI`/`Design System`), mas não cobre `Landing Pages`/`Dashboards`, que já têm domínio próprio.
- **Option D (Composition of existing domains)** — **Escolhida como classificação primária**, complementada por C. Ver Decision.

### Marketplace

- **Option A (Business Domain)** — Rejeitada. Zero Aggregate candidato, zero especificação real.
- **Option B (Product Layer)** — **Escolhida como classificação primária** — é, e permanece, um item do catálogo de `PRODUCTS.md`, vendável como parte da oferta `NOVARIS SaaS`.
- **Option C (Platform Capability)** — Corretamente descreve sua *implementação técnica* (composição de `integration-hub` + `Organization`/`configuration`/`feature-flags`), não sua natureza de produto.
- **Option D (Composition of existing domains)** — Não se aplica da mesma forma que `Growth`/`CRM`/`Studio`: `Marketplace` não compõe **Business Domains** de negócio, compõe **Infrastructure/Domain Capabilities do Kernel** — distinção registrada em Decision.

## Decision

**Studio — Option D (Product Layer, entregue por composição), com um componente de Option C.** `Studio` permanece um produto de `PRODUCTS.md` (Product Layer, `ADR-0007` já confirmado), **entregue por**:
- `Marketing Domain` (`Landing Page`) — já existente, Objetos confirmados.
- `Analytics Domain` (`Dashboard`) — já existente, Objetos confirmados.
- Um **motor de construção/renderização** (`Sites`, `Portais`, `Aplicações`, `UX`, `UI`, `Design System`) que não corresponde a nenhum Business Domain — melhor classificado como um futuro **Platform Capability** (page/app builder), no mesmo padrão estrutural de `automation-runtime`/`ai-runtime`, **ainda não criado** (nenhum scaffolding existe hoje em `services/kernel/`).

Nenhum `services/domains/studio/` deve ser criado. Se um motor de construção for implementado no futuro, deve nascer em `services/kernel/` (Infrastructure/Platform Capability), nunca em `services/domains/`.

**Marketplace — Option B (Product Layer), entregue por composição de Capabilities do Kernel, não de Business Domains.** `Marketplace` permanece um produto/feature de `PRODUCTS.md`/`NOVARIS_OS.md § 7` (parte de `NOVARIS SaaS`), **entregue por**:
- `integration-hub` (Infrastructure Capability já confirmada) — conectividade com apps/plugins de terceiros.
- `Organization` + `configuration`/`feature-flags` (Kernel) — multi-tenancy e white-label.

Nenhum `services/domains/marketplace/` deve ser criado. A nota especulativa de `ADR-0007` ("futuro domínio ainda não criado") é **substituída** por esta ADR: não há, hoje, nenhuma evidência que justifique tratar `Marketplace` como domínio futuro — se isso mudar, exigirá uma nova Discovery com evidência própria, não uma presunção.

## Consequences

**Positivas:**
- Resolve as duas últimas pendências nomeadas de posição de produto/domínio registradas em `NOVARIS_PLATFORM_ARCHITECTURE.md § 12` desde `ENG-0016`/`ENG-0017`.
- Refuta, com evidência concreta, o achado de `PRODUCT_DOMAIN_ARCHITECTURE.md` de que `Studio` seria "completamente órfão" — 2 de seus 8 recursos já têm domínio real.
- Reforça o princípio "Product ≠ Domain" (`ARCHITECTURE_GOVERNANCE.md`) com um caso adicional que **combina** Business Domains e Infrastructure Capabilities na composição de um único produto — precedente novo, não visto em `Growth`/`CRM` (que compunham só Business Domains).

**Negativas / pendências:**
- O "motor de construção" de `Studio` (`Sites`/`Portais`/`Aplicações`/`UX`/`UI`/`Design System`) não tem nenhuma implementação, nem mesmo scaffolding — permanece uma lacuna de arquitetura futura, não resolvida por esta ADR (só classificada).
- `DOMAIN_MODEL.md` não é alterado — nem `Studio` nem `Marketplace` nunca tiveram seção própria lá, nada a remover ou sincronizar.
- `ADR-0007`'s nota especulativa sobre `Marketplace` permanece no documento original (não editada) — esta ADR a substitui em autoridade, não no texto.

## Product Impact

- `PRODUCTS.md § NOVARIS Studio`/`§ NOVARIS Marketplace` permanecem 100% `TODO` — não preenchidos por esta ADR (fora de escopo; nenhuma especificação funcional foi inventada).
- Uma futura especificação de `Studio` (`specifications/studio/features.md`) deve referenciar `Marketing`/`Analytics` para `Landing Page`/`Dashboard`, em vez de modelar Entities próprias para esses dois conceitos.
- Uma futura especificação de `Marketplace` (`specifications/marketplace/features.md`) deve referenciar `integration-hub`/`Organization` como suas dependências de Kernel, sem presumir um Bounded Context próprio.
- Nenhum roadmap de implementação (`IMPLEMENTATION_ROADMAP.md`) é alterado por esta ADR — nem `Studio` nem `Marketplace` nunca estiveram na cadeia de domínios daquele documento.

## Responsável

Decisão de arquitetura: Engenheiro Principal, por delegação da Ordem de Missão `ENG-0030`, resolvendo as duas últimas pendências nomeadas de posição de produto/domínio do EPIC-007. Execução: Engenheiro Principal.

## Data

2026-07-16

## Impactos

Criado: `adr/ADR-0018-studio-marketplace-position.md`. Nenhum código, Entity, Aggregate, service ou contract criado/alterado. `DOMAIN_MODEL.md` não alterado (nunca continha seções para `Studio`/`Marketplace`).

## Plano de Migração

Não aplicável — nenhum código ou dado real referenciava `Studio`/`Marketplace` como domínio antes desta decisão.

## Status

Aceito

---

## Relação com Outros Módulos

- [adr/ADR-0007-domain-boundaries.md](ADR-0007-domain-boundaries.md) — precedente direto, negação original de `Studio` como domínio, nota especulativa sobre `Marketplace`
- [knowledge/core/NOVARIS_OS.md § 7](../knowledge/core/NOVARIS_OS.md) — descrições funcionais de ambos, evidência decisiva
- [knowledge/core/DOMAIN_MODEL.md § MARKETING DOMAIN, § ANALYTICS DOMAIN](../knowledge/core/DOMAIN_MODEL.md) — origem dos objetos `Landing Page`/`Dashboard`, sobreposição decisiva com `Studio`
- [services/kernel/KERNEL_BOUNDARY_REVIEW.md](../services/kernel/KERNEL_BOUNDARY_REVIEW.md) — classificação de `integration-hub` como Infrastructure Capability, base da composição de `Marketplace`
- [knowledge/architecture/decisions/PRODUCT_DOMAIN_ARCHITECTURE.md § 6-8](../knowledge/architecture/decisions/PRODUCT_DOMAIN_ARCHITECTURE.md) — origem das pendências resolvidas por esta ADR
- [knowledge/architecture/decisions/NOVARIS_PLATFORM_ARCHITECTURE.md § 12](../knowledge/architecture/decisions/NOVARIS_PLATFORM_ARCHITECTURE.md) — pendências oficiais, agora resolvidas
- [ADR-0011](../knowledge/architecture/decisions/ADR-0011-crm-domain-position.md) (nota: vive em `knowledge/architecture/decisions/`, não em `adr/` — ver `ADR-0011 § Nota de Numeração e Localização`), [ADR-0013](ADR-0013-automation-domain-confirmation.md), [ADR-0014](ADR-0014-ai-architectural-position.md), [ADR-0015](ADR-0015-knowledge-domain-position.md) — precedentes metodológicos diretos
