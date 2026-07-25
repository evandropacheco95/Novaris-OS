# NOVARIS — Domain Context Map

Versão: 1.0.0

Status: 🟢 Oficial — mapeamento de Bounded Contexts, nenhuma decisão de arquitetura nova, nenhum código

Missão: ENG-0009 (Business Context Mapping) — abre EPIC-007 (Business Domain Discovery)

Escopo: mapear todos os Bounded Contexts da plataforma NOVARIS, usando exclusivamente a estrutura já documentada e a estrutura real do repositório — nenhum domínio, Aggregate, Entidade ou Evento foi inventado. Nenhum código foi criado ou alterado. Nenhum ADR foi criado (nenhum conflito arquitetural *novo* foi encontrado — as divergências catalogadas abaixo já eram conhecidas e registradas em `PROJECT_RULES.md` antes desta missão).

**Nota de método, crítica para todo este documento**: a plataforma tem **cinco listas divergentes** de domínios/produtos, nenhuma delas cancelada ou reconciliada — `NOVARIS_OS.md § 7` (6), `PRODUCTS.md` (9), `ORGANIZATION.md` (10), `SYSTEM_ARCHITECTURE.md § 5` (15), `DOMAIN_MODEL.md` (13). `ADR-0007` já formalizou a distinção entre **Product Layer** (`PRODUCTS.md` — "o que a NOVARIS vende", nunca uma fronteira de dados) e **Domain Layer** (`DOMAIN_MODEL.md` — bounded contexts técnicos, DDD, com objetos e eventos próprios) — esta é a única das cinco listas com objetos de dados reais associados (via `BOM.md`), e é a que este documento usa como base primária para Bounded Contexts. As outras quatro são citadas para contexto, nunca tratadas como fonte de Bounded Context.

---

## 1. Resumo Executivo

A plataforma NOVARIS tem, hoje, **3 Bounded Contexts com implementação real** (`Identity`, `Organizations`/`Workspace`, `Audit`/fragmento de `System` — todos em `services/kernel/`, EPICs 002/003/005) e **6 Bounded Contexts como scaffolding vazio** (`services/domains/{sales,customer,financial,marketing,projects,analytics}`, criados por `ADR-0007`/`ENG-0000.1`/`.2`, zero código). Dos 13 domínios definidos em `DOMAIN_MODEL.md`, **4 não têm nenhuma pasta correspondente em lugar nenhum do repositório** (`Activity`, `Knowledge`, `AI`, `Automation`) — `AI` e `Automation` têm módulos de **Infrastructure** em `services/kernel/` (`ai-runtime`, `automation-runtime`), mas nenhum Bounded Context de negócio com objetos próprios. `Knowledge` está formalmente bloqueado (`IMPLEMENTATION_ROADMAP.md § 6`, Risco R5 — "não tem nenhum objeto do BOM mapeável"). Este documento cataloga os 13 contextos com o rigor que a fase de Discovery já aplicou a `Identity`/`Organization`/`Audit`, sem modelar nenhum deles além do que já existe.

## 2. Inventário de Contextos

Base: `DOMAIN_MODEL.md` (13 domínios, única lista com objetos de dados via `BOM.md` e regra de dependência explícita). Para cada um, o estado real de implementação:

| # | Domínio (`DOMAIN_MODEL.md`) | Pasta real | Estado |
|---|---|---|---|
| 1 | Identity | `services/kernel/identity/` | 🟢 Implementado — `User`/`Role` Aggregates, 3 Domain Services, `IDENTITY_DOMAIN_CLOSURE.md` |
| 2 | Workspace | `services/kernel/organizations/` | 🟢 Implementado — `Organization` Aggregate, `ORGANIZATION_FINAL_ARCHITECTURE_REVIEW.md` — **nome divergente**: `DOMAIN_MODEL.md` chama "Workspace Domain", a implementação inteira (pasta, testes, documentos) chama "Organization Domain"; nunca reconciliado (ver § 6) |
| 3 | Relationship | `services/domains/customer/` | 🟡 Scaffolding — renomeado para `customer` por `ADR-0007`, zero código |
| 4 | Sales | `services/domains/sales/` | 🟡 Scaffolding — zero código |
| 5 | Activity | *nenhuma* | ⚪ Não iniciado — nem scaffolding existe |
| 6 | Project | `services/domains/projects/` | 🟡 Scaffolding — zero código |
| 7 | Marketing | `services/domains/marketing/` | 🟡 Scaffolding — zero código |
| 8 | Knowledge | *nenhuma* | 🔴 Bloqueado — `IMPLEMENTATION_ROADMAP.md § 6`, Risco R5: nenhum objeto do BOM mapeável |
| 9 | AI | *nenhuma como Domain*; `services/kernel/ai-runtime/` existe como Infrastructure | ⚪ Não iniciado como Domain — só execução (Infrastructure), `packages/ai/` guarda definições (Agent/Prompt/Tool/Memory) sem modelagem de domínio |
| 10 | Automation | *nenhuma como Domain*; `services/kernel/automation-runtime/` existe como Infrastructure | ⚪ Não iniciado como Domain — só execução (Infrastructure) |
| 11 | Financial | `services/domains/financial/` | 🟡 Scaffolding — zero código |
| 12 | Analytics | `services/domains/analytics/` | 🟡 Scaffolding — zero código |
| 13 | System | *nenhuma pasta própria*; `services/kernel/audit/` cobre só o fragmento `Audit Log` | 🟡 Parcialmente coberto — `Audit` (implementado) é 1 de ~10 objetos do System Domain (`Audit Log`, `Event Log`, `Integration`, `Webhook`, `Job`, `Queue`, `Release`, `Migration`, `Feature Flag`, `Health Check`); os demais 9 não têm Bounded Context |

**6 de 13 domínios têm pasta em `services/domains/`** (confirmado por `DOMAIN_MODEL.md` linha 624 e por inspeção direta — nenhuma tem `src/`). **2 de 13 (`Identity`, `Workspace`) já são Bounded Contexts reais dentro de `services/kernel/`** — tratados como Kernel, não Business Domain, por decisão já congelada (`ADR-0004`/`ADR-0006`). **1 de 13 (`System`) está parcialmente coberto** por `Audit`. **4 de 13 (`Activity`, `Knowledge`, `AI`, `Automation`) não têm Bounded Context algum.**

## 3. Classificação Estratégica (Core / Supporting / Generic Domain)

**Nenhuma fonte oficial já classifica os domínios desta forma** — a classificação abaixo é **Proposta** (inferência baseada em DDD estratégico, Eric Evans/Vaughn Vernon), não uma decisão já tomada. Requer validação explícita do CTO/Product antes de guiar qualquer priorização de investimento de engenharia.

| Domínio | Classificação proposta | Justificativa |
|---|---|---|
| **AI** | Core Domain | Citado como diferencial central em `NOVARIS_OS.md § 7` e `CONSTITUTION.md` (IA como parte estrutural, não acessório); nenhum concorrente genérico resolveria isso pronto |
| **Sales** / **Relationship (customer)** | Core Domain | CRM é o produto mais detalhado e citado primeiro em `PRODUCTS.md`/`NOVARIS_OS.md` — provável carro-chefe comercial |
| **Automation** | Core Domain | Integração profunda com n8n/Make/WhatsApp/Meta descrita extensivamente em `NOVARIS_OS.md § 7` como parte da proposta de valor, não plumbing genérico |
| **Workspace** | Supporting Domain | Backbone de multi-tenancy necessário para todos os outros — não é, em si, o que a NOVARIS vende |
| **Marketing** | Supporting Domain | Suporta Sales/CRM; funcionalidade comparável a produtos de mercado já maduros |
| **Project** | Supporting Domain | Suporta entrega de Automation/CRM, não a proposta de valor central |
| **Financial** | Supporting Domain (candidato a Core se vendido como produto próprio — `PRODUCTS.md` o lista separadamente) | Ambíguo — requer decisão de produto |
| **Analytics** | Supporting Domain | KPIs/dashboards suportam todos os domínios; diferencial real dependeria de IA aplicada (então parte do Core `AI`, não deste domínio isoladamente) |
| **Knowledge** | Supporting Domain | Wiki/documentação — nenhuma fonte sugere diferencial competitivo aqui |
| **Activity** | Generic Domain | Agenda/tarefas/calendário — funcionalidade padrão de qualquer plataforma de produtividade |
| **Identity** | Generic Domain | Autenticação/autorização — problema já resolvido pelo mercado (Auth0, Supabase Auth); NOVARIS optou por construir próprio (`ADR-0010`), mas isso não muda a classificação estratégica |
| **System** | Generic Domain | Logs, auditoria, integrações técnicas — infraestrutura necessária, não diferencial |

## 4. Mapa Geral

**Mapa Real** (o que existe implementado hoje, `services/kernel/` — confirmado por `KERNEL_BOUNDARY_REVIEW.md`, ENG-0007):

```
Shared Kernel (packages/shared-kernel/)
  ↓
Identity (Domain Capability — implementado)
  ↓
Organizations / "Workspace" (Domain Capability — implementado)
  ↓
Audit (Domain Capability — implementado; cobre só fragmento de "System")
```

Nenhum Business Domain (`services/domains/*`) tem código real — o "mapa real" acima é inteiramente Kernel.

**Mapa Planejado** (`DOMAIN_MODEL.md § DEPENDÊNCIAS`, cadeia verbatim, regra: "nenhum domínio pode depender de um domínio abaixo dele"):

```
Identity
  ↓
Workspace
  ↓
Relationship (pasta real: customer)
  ↓
Sales
  ↓
Activity
  ↓
Project (pasta real: projects)
  ↓
Marketing
  ↓
Knowledge  ⚠️ BLOQUEADO (Risco R5)
  ↓
AI
  ↓
Automation
  ↓
Financial
  ↓
Analytics
  ↓
System (parcialmente coberto por Audit)
```

Esta é a estrutura **real encontrada** na documentação — não a cadeia hipotética de exemplo da própria Ordem de Missão (que citava CRM/Sales/Growth/Studio/Marketplace/Billing, nomes de `PRODUCTS.md`/`SYSTEM_ARCHITECTURE.md`, não de `DOMAIN_MODEL.md`). Um produto (`PRODUCTS.md`) é entregue por um ou mais domínios — nunca é, em si, um domínio (`ADR-0007`).

## 5. Fronteiras (Bounded Contexts Detalhados)

Para os 3 contextos já implementados, os dados são **Citados** (fonte: Freeze/Closure já congelados). Para os 10 restantes, todo campo é **candidato**, extraído de `BOM.md`/`DOMAIN_MODEL.md`, nunca modelado.

### Identity 🟢 (implementado)

- **Responsabilidade**: usuários, autenticação, autorização, roles, permissões (`IDENTITY_DOMAIN_CLOSURE.md § 8`).
- **Linguagem Ubíqua**: `User`, `Role`, `Permission`, `Email`.
- **Entidades candidatas**: `Session`, `IdentityProvider`, `Token` (propostas em `IDENTITY_DOMAIN_MODEL.md § 1`, nunca modeladas — fora de escopo técnico do Blueprint).
- **Aggregates**: `User`, `Role` (confirmados, implementados).
- **Domain Events**: `UserCreated`, `UserInvited`, `UserActivated`, `UserDisabled`, `RoleCreated`, `RoleAssignedToUser`, `RoleRevokedFromUser`, `PermissionGrantedToRole`, `PermissionRevokedFromRole` (todos implementados).
- **Dependências permitidas**: nenhuma — é o primeiro domínio da cadeia.
- **Dependências proibidas**: todos os demais 12 domínios (Identity nunca depende de nada abaixo dele).

### Workspace / Organizations 🟢 (implementado)

- **Responsabilidade**: organizações (tenants), times, configurações, branding, planos, billing, storage, feature flags (`DOMAIN_MODEL.md` linha 86-123; parcialmente implementado, `ORGANIZATION_TECHNICAL_BLUEPRINT.md § 3` exclui `branding`/`plan`/`billingStatus`/`featureFlags`/`settings` do Aggregate real).
- **Linguagem Ubíqua**: `Organization` (implementado); `Workspace`, `Team`, `Subscription`, `Plan` (candidatos, `DEC-ORG-002/003/004`, não confirmados como Aggregate próprio).
- **Entidades candidatas**: `Storage`, `Environment`.
- **Aggregates**: `Organization` (confirmado, implementado); `Workspace`/`Team` candidatos a Aggregate Root próprio, sem Object Specification.
- **Domain Events**: `OrganizationCreated` (único definitivo); `OrganizationActivated`/`Updated`/`Suspended`/`PlanChanged`/`BillingFailed`/`Archived`/`Deleted` (candidatos, divergência de fonte não resolvida).
- **Dependências permitidas**: Identity.
- **Dependências proibidas**: Relationship, Sales, Activity, Project, Marketing, Knowledge, AI, Automation, Financial, Analytics, System.

### System / Audit 🟡 (parcialmente implementado)

- **Responsabilidade real implementada**: trilha de auditoria imutável (`AuditEntry`, `AUDIT_FINAL_ARCHITECTURE_REVIEW.md`) — só 1 dos ~10 objetos do System Domain de `DOMAIN_MODEL.md`.
- **Linguagem Ubíqua**: `AuditEntry`, `Actor`, `Target`, `ChangeSet`, `Origin` (`AUDIT_UBIQUITOUS_LANGUAGE.md`).
- **Entidades/objetos candidatos, não cobertos por `Audit`**: `Event Log`, `Integration`, `Webhook`, `Job`, `Queue`, `Release`, `Migration`, `Feature Flag`, `Health Check`.
- **Aggregates**: `AuditEntry` (confirmado, implementado, write-once). Demais objetos: nenhum candidato a Aggregate avaliado ainda.
- **Domain Events**: nenhum confirmado para `AuditEntry` (`AUDIT_AGGREGATE_DESIGN_FREEZE.md § 11`, não decidido).
- **Dependências permitidas**: Identity, Workspace (e, transitivamente, qualquer domínio de origem que precise ser auditado).
- **Dependências proibidas**: nenhuma no sentido tradicional (System está no topo/fim da cadeia) — mas `Audit` nunca deve depender de tipos concretos de nenhum domínio (`AUDIT_BOUNDED_CONTEXT.md § 9`).

### Relationship / Customer 🟡 (scaffolding)

- **Responsabilidade**: pessoas, empresas, relacionamentos, contatos, interações.
- **Linguagem Ubíqua candidata**: `Party`, `Person`, `External Organization`, `Relationship`, `Contact`.
- **Aggregates candidatos**: `Party` (possível supertipo de `Person`/`External Organization` — especulativo, não avaliado).
- **Domain Events candidatos**: `RelationshipCreated` (único citado, `DOMAIN_MODEL.md § EVENT BUS`).
- **Dependências permitidas**: Identity, Workspace.
- **Dependências proibidas**: Sales, Activity, Project, Marketing, Knowledge, AI, Automation, Financial, Analytics, System.

### Sales 🟡 (scaffolding)

- **Responsabilidade**: oportunidades, pipelines, negociação, propostas, contratos, receitas.
- **Linguagem Ubíqua candidata**: `Opportunity`, `Pipeline`, `Stage`, `Proposal`, `Contract`, `Revenue`.
- **Aggregates candidatos**: `Opportunity` (candidato mais forte — tem identidade e ciclo de vida claro através de `Stage`, análogo ao raciocínio já usado para confirmar `Organization`/`AuditEntry`, mas **não avaliado formalmente**).
- **Domain Events candidatos**: `OpportunityCreated`, `OpportunityWon` (citados em `DOMAIN_MODEL.md § EVENT BUS`).
- **Dependências permitidas**: Identity, Workspace, Relationship.
- **Dependências proibidas**: Activity, Project, Marketing, Knowledge, AI, Automation, Financial, Analytics, System.

### Activity ⚪ (não iniciado, nem scaffolding)

- **Responsabilidade**: agenda, atividades, tarefas, calendário, follow-up, timeline.
- **Linguagem Ubíqua candidata**: `Activity`, `Task`, `Calendar Event`, `Reminder`, `Timeline`, `Comment`, `Checklist`.
- **Conflito já registrado, não resolvido aqui**: `Task` aparece também em Project Domain — `DOMAIN_MODEL.md` viola sua própria regra "todo objeto pertence a exatamente um domínio".
- **Dependências permitidas**: Identity, Workspace, Relationship, Sales.
- **Dependências proibidas**: Project, Marketing, Knowledge, AI, Automation, Financial, Analytics, System.

### Project / Projects 🟡 (scaffolding)

- **Responsabilidade**: projetos, sprints, roadmap, backlog, kanban.
- **Linguagem Ubíqua candidata**: `Project`, `Epic`, `Story`, `Task`, `Sprint`, `Milestone`, `Release`.
- **Conflito já registrado, não resolvido aqui**: `Task` (com Activity); `Release` (com System, per `IMPLEMENTATION_ROADMAP.md § 6` Risco R4).
- **Dependências permitidas**: Identity, Workspace, Relationship, Sales, Activity.
- **Dependências proibidas**: Marketing, Knowledge, AI, Automation, Financial, Analytics, System.

### Marketing 🟡 (scaffolding)

- **Responsabilidade**: campanhas, landing pages, SEO, conteúdo, social media.
- **Linguagem Ubíqua candidata**: `Campaign`, `Landing Page`, `Asset`, `Template`, `Content`, `Audience`. **Nota**: `Landing Page`/`Template`/`Content`/`Audience` citados em `DOMAIN_MODEL.md` mas ausentes de `BOM.md` — divergência de catálogo já registrada, não resolvida.
- **Dependências permitidas**: Identity, Workspace, Relationship, Sales, Activity, Project.
- **Dependências proibidas**: Knowledge, AI, Automation, Financial, Analytics, System.

### Knowledge 🔴 (bloqueado)

- **Responsabilidade**: documentação, wiki, playbooks, artigos.
- **Linguagem Ubíqua candidata**: `Knowledge`, `Article`, `Playbook`, `Manual`, `Specification`, `ADR`.
- **Bloqueio formal**: `IMPLEMENTATION_ROADMAP.md § 6`, Risco R5 — "não tem nenhum objeto do BOM mapeável". Nenhum candidato a Aggregate pode ser proposto com confiança até essa lacuna ser resolvida.
- **Dependências permitidas**: todos os 7 domínios anteriores na cadeia.
- **Dependências proibidas**: AI, Automation, Financial, Analytics, System.

### AI ⚪ (não iniciado como Domain; Infrastructure existe)

- **Responsabilidade (como Domain)**: agentes, prompts, contexto, memória, ferramentas, embeddings.
- **Linguagem Ubíqua candidata**: `Agent`, `Prompt`, `Memory`, `Context`, `Embedding`, `Tool`, `Decision`, `Insight`, `Recommendation` — já catalogados como Intelligence Objects em `BOM.md § 6` e referenciados por `packages/ai/` (estrutura, sem modelagem).
- **Nota de fronteira já existente**: `packages/ai/README.md` já distingue "definição" (aqui) de "execução" (`services/kernel/ai-runtime/`, Infrastructure Capability, `KERNEL_BOUNDARY_REVIEW.md`) — mas nenhum dos dois é, hoje, um Bounded Context de negócio com Aggregate próprio.
- **Dependências permitidas**: todos os 8 domínios anteriores.
- **Dependências proibidas**: Automation, Financial, Analytics, System.

### Automation ⚪ (não iniciado como Domain; Infrastructure existe)

- **Responsabilidade (como Domain)**: workflows, triggers, queues, execuções.
- **Linguagem Ubíqua candidata**: `Workflow`, `Automation`, `Execution`, `Trigger`, `Action`, `Condition`, `Queue`.
- **Conflito já registrado, não resolvido aqui**: `Queue` aparece também em System Domain.
- **Dependências permitidas**: todos os 9 domínios anteriores.
- **Dependências proibidas**: Financial, Analytics, System.

### Financial 🟡 (scaffolding)

- **Responsabilidade**: receitas, despesas, pagamentos, faturamento.
- **Linguagem Ubíqua candidata**: `Invoice`, `Expense`, `Payment`, `Subscription`, `Billing`, `Commission`.
- **Conflito já registrado, não resolvido aqui**: `Subscription` aparece também em Workspace Domain (`DEC-ORG-003` já tratou parcialmente isso para o Organization Domain, concluindo que `Subscription` pertence ao "Organization/Workspace Domain" — tensão com esta lista de `DOMAIN_MODEL.md`, que a lista em Financial, não resolvida por esta missão).
- **Dependências permitidas**: todos os 10 domínios anteriores.
- **Dependências proibidas**: Analytics, System.

### Analytics 🟡 (scaffolding)

- **Responsabilidade**: KPIs, métricas, dashboards, forecast.
- **Linguagem Ubíqua candidata**: `Dashboard`, `Widget`, `Metric`, `Report`, `Forecast`, `Snapshot`, `Benchmark`.
- **Dependências permitidas**: todos os 11 domínios anteriores.
- **Dependências proibidas**: System.

### System ⚪ (sem pasta própria — ver Audit acima para o fragmento implementado)

- Já detalhado na entrada "System / Audit" acima.

## 6. Dependências

**Regra geral já congelada** (`DOMAIN_MODEL.md § DEPENDÊNCIAS`): "Nenhum domínio pode depender de um domínio abaixo dele" na cadeia de 13. Nenhum domínio de negócio (`services/domains/*`) acessa outro diretamente, só via Eventos ou API (`DOMAIN_MODEL.md § REGRAS`, já citado por toda a cadeia de Freezes de Identity/Organization/Audit).

**Já confirmado, sem violação**, pelos 3 contextos implementados: `Identity` não depende de nada; `Organization` (Workspace) depende só de `Identity` (referência por `organizationId`... na verdade o inverso — outros domínios referenciam `Organization`, não o contrário); `Audit` referencia `Identity`/`Organization` só por id, nunca por tipo concreto (`KERNEL_BOUNDARY_REVIEW.md § 3`, "nenhuma dependência circular encontrada").

**Divergência de nomenclatura não resolvida**: `DOMAIN_MODEL.md` chama o segundo domínio da cadeia de "Workspace"; toda a implementação real (pasta, testes, 14 documentos do EPIC-003) chama de "Organization Domain". Nenhuma das duas nomenclaturas foi formalmente escolhida como única — registrado aqui, não resolvido (não constitui conflito arquitetural *novo* o suficiente para exigir ADR nesta missão, mas é candidato forte para uma futura consolidação terminológica).

## 7. Riscos

| Risco | Classificação |
|---|---|
| 5 listas de domínio/produto divergentes, nunca reconciliadas — risco de nomear um domínio/produto errado ao criar `apps/`, `specifications/<domínio>/` ou documentação nova (já registrado, `IMPLEMENTATION_ROADMAP.md § 6`, Risco R2) | **Alto** |
| `Task` (Activity/Project), `Queue` (Automation/System), `Subscription` (Workspace/Financial), `Release` (Project/System) — 4 objetos em dois domínios cada, violando a própria regra de `DOMAIN_MODEL.md` ("todo objeto pertence a exatamente um domínio") | **Alto** |
| `Knowledge` bloqueado sem nenhum objeto do BOM mapeável — qualquer trabalho de Discovery nesse domínio corre risco real de inventar conteúdo sem fonte | **Alto** |
| Divergência de nome "Workspace" (`DOMAIN_MODEL.md`) vs. "Organization" (implementação real) nunca reconciliada | **Médio** |
| `AI`/`Automation` têm Infrastructure (`ai-runtime`/`automation-runtime`) mas nenhum Domain — risco de uma futura missão presumir que a Infrastructure já cobre a modelagem de negócio, quando na verdade nenhum Aggregate/Entidade de negócio foi definido para nenhum dos dois | **Médio** |
| `services/domains/marketing/`'s objetos candidatos (`Landing Page`, `Template`, `Content`, `Audience`) citados só em `DOMAIN_MODEL.md`, ausentes de `BOM.md` — risco de modelar algo sem base dupla de fonte | **Médio** |
| `Financial`'s `Subscription` conflita com a conclusão já tomada por `DEC-ORG-003` (Organization/Workspace Domain é dono de `Subscription`) — duas fontes de decisão parcialmente conflitantes | **Médio** |
| Criação de `knowledge/architecture/` (nova pasta, autorizada explicitamente por esta ordem) ao lado do `architecture/` já existente na raiz do repositório — mesma classe de sobreposição de nome já registrada para `SYSTEM_ARCHITECTURE.md` vs. `architecture/` (`PROJECT_RULES.md`) | **Baixo, mas registrado** |

## 8. Pendências

- Reconciliar as 5 listas de domínio/produto (fora do escopo desta missão — requer decisão de produto/CTO, provável ADR quando resolvida).
- Resolver os 4 objetos duplicados entre domínios (`Task`, `Queue`, `Subscription`, `Release`).
- Decidir a nomenclatura definitiva do segundo domínio da cadeia (`Workspace` vs. `Organization`).
- Resolver o bloqueio de `Knowledge` (Risco R5) antes de qualquer Discovery formal desse domínio.
- Avaliar formalmente `AI`/`Automation` como candidatos a Domain (não só Infrastructure) — mesma disciplina já usada para não confundir `configuration`/`feature-flags` com Infrastructure genérica (`KERNEL_BOUNDARY_REVIEW.md § 5`).
- Confirmar se `knowledge/architecture/` deve absorver, redirecionar ou coexistir com `architecture/` (raiz) — não decidido por esta missão.

## 9. Próximos Passos

Recomendados, não decididos por esta missão:

1. Uma Discovery formal para o Bounded Context com maior evidência de identidade/ciclo de vida entre os não-implementados — candidato mais forte, por análise estrutural: `Sales` (`Opportunity` com `Stage`, análogo ao raciocínio que já confirmou `Organization`/`AuditEntry` como Aggregates).
2. Resolver a divergência `Workspace`/`Organization` antes de qualquer nova missão que cite o domínio pelo nome de `DOMAIN_MODEL.md`.
3. Uma missão dedicada de reconciliação terminológica entre as 5 listas de domínio/produto — pré-requisito para qualquer Epic de Business Domain avançar sem repetir a ambiguidade já registrada.

---

## Validações

- **Link Checker** (`-Root` explícito): ver ENG-0009 FINAL REPORT.
- **ARG (ENS-0002)**: N/A nos critérios de código (nenhum foi produzido); PASS nos demais.
- **Domain Model Validation**: nenhuma Entity/Aggregate/Value Object/Domain Event foi criado ou confirmado por esta missão — todo Bounded Context não implementado permanece explicitamente "candidato".

## Relação com Outros Módulos

- [DOMAIN_MODEL.md](../core/DOMAIN_MODEL.md), [BOM.md](../core/BOM.md), [PRODUCTS.md](../core/PRODUCTS.md), [SYSTEM_ARCHITECTURE.md](../core/SYSTEM_ARCHITECTURE.md), [NOVARIS_OS.md](../core/NOVARIS_OS.md), [ORGANIZATION.md](../core/ORGANIZATION.md) — as 5+1 fontes de domínio/produto já citadas
- [adr/ADR-0007](../../adr/ADR-0007-domain-boundaries.md) — distinção Product/Domain Layer, base metodológica deste mapa
- [services/domains/README.md](../../services/domains/README.md) — os 6 Bounded Contexts scaffolded
- [services/kernel/KERNEL_BOUNDARY_REVIEW.md](../../services/kernel/KERNEL_BOUNDARY_REVIEW.md) — classificação Domain/Infrastructure do Kernel, base do "Mapa Real"
- [PROJECT_RULES.md](../../PROJECT_RULES.md) — registro consolidado das divergências de lista já conhecidas

## Status

🟢 Mapa de Bounded Contexts concluído (Missão ENG-0009). Nenhum código, Aggregate ou ADR criado. Abre `EPIC-007` — próxima missão condicionada à aprovação do CTO.
