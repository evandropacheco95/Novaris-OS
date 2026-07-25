# DOMAIN_MODEL.md

Versão 1.3

Status: Oficial

Autoridade: Chief Architect

⚠️ **Nota de Reconciliação (ENG-0024, `ADR-0011`/`ADR-0013`/`ADR-0014`)**: as seções `AI DOMAIN` e `AUTOMATION DOMAIN` abaixo foram marcadas como **removidas da lista ativa de Business Domains** — decisão formal, não inferência (`ADR-0013`: `Automation` é Platform Capability; `ADR-0014`: `AI` é Transversal Intelligence Layer). O texto original de cada seção é preservado integralmente, marcado como histórico, não apagado. Nenhuma outra seção do texto original (linhas abaixo até `FIM`) foi alterada em conteúdo — só as duas seções nomeadas e a cadeia de `DEPENDÊNCIAS`, pela mesma razão. `CRM` nunca teve seção própria neste documento — nada a remover; a nota já existente (§ "Relação com Outros Módulos") é reafirmada com a citação formal de `ADR-0011`.

⚠️ **Nota de Reconciliação II (ENG-0026, `ADR-0015`)**: a seção `KNOWLEDGE DOMAIN` abaixo foi marcada como **removida da lista ativa de Business Domains**, mesmo tratamento e mesma disciplina de preservação de texto histórico já aplicados a `AI DOMAIN`/`AUTOMATION DOMAIN` (`ADR-0015`: `Knowledge` é absorvido pela AI Transversal Intelligence Layer). A cadeia de `DEPENDÊNCIAS` recebeu uma segunda atualização, removendo também o nó `Knowledge`.

⚠️ **Nota de Reconciliação III (ENG-0028, `ADR-0016`)**: diferente das duas reconciliações anteriores (que removeram seções de domínio inteiras), esta remove apenas **um objeto duplicado** — `Task` foi removido dos "Objetos" de `ACTIVITY DOMAIN` (permanece, confirmado, em `PROJECT DOMAIN`). `ACTIVITY DOMAIN` continua um Business Domain ativo, sem alteração de status. Texto original preservado (linha riscada, não apagada). `BACKLOG.md`'s hierarquia `Epic→Feature→Story→Task→Subtask` e a pergunta Entity-vs-Aggregate-Root de `Task` **não foram resolvidas** — documentadas como preocupação futura nas próprias seções abaixo, por instrução explícita da Ordem de Missão.

---

# PROPÓSITO

Este documento define todos os domínios oficiais da plataforma NOVARIS.

Todo objeto pertence a exatamente um domínio.

Nenhum domínio poderá possuir responsabilidades duplicadas.

Toda comunicação entre domínios deverá ocorrer através de APIs públicas
ou eventos.

---

# VISÃO GERAL

                    NOVARIS OS

                         │

 ┌────────────────────────────────────────────┐

                PLATFORM KERNEL

 └────────────────────────────────────────────┘

                         │

────────────────────────────────────────────────────

IDENTITY DOMAIN

────────────────────────────────────────────────────

Responsável por:

Usuários

Autenticação

Autorização

Perfis

Roles

Permissões

Sessões

Tokens

SSO

MFA

Audit Login

Objetos

User

Role

Permission

Session

IdentityProvider

Token

API Key

---

WORKSPACE DOMAIN

Responsável por:

Organizações

Times

Espaços

Configurações

Branding

Planos

Billing

Storage

Feature Flags

Objetos

Organization

Workspace

Team

Subscription

Plan

Storage

Environment

---

RELATIONSHIP DOMAIN

Responsável por:

Pessoas

Empresas

Relacionamentos

Contatos

Interações

Objetos

Party

Person

External Organization

Relationship

Contact

Address

Phone

Email

Social Profile

---

SALES DOMAIN

Responsável por:

Oportunidades

Pipelines

Etapas

Negociação

Propostas

Contratos

Receitas

Objetos

Opportunity

Pipeline

Stage

Proposal

Quotation

Contract

Revenue

Product *(`ADR-0043`, adicionado — catálogo interno, adaptado do Salesforce Product2, suporta `Quotation`)*

---

ACTIVITY DOMAIN

Responsável por:

Agenda

Atividades

Tarefas ⚠️ *(ver nota de reconciliação abaixo — cumprida por referência, não por posse)*

Calendário

Follow-up

Timeline

Objetos

Activity

~~Task~~ — REMOVIDO dos Objetos de `ACTIVITY DOMAIN` (`ADR-0016`, ENG-0027/ENG-0028)

Calendar Event

Reminder

Timeline

Comment

Checklist

Case *(`ADR-0043`, adicionado — registro de atendimento a um Party, adaptado do Salesforce Service Cloud)*

⚠️ **Nota de Reconciliação III (ENG-0028, `ADR-0016`)**: `Task` foi removido dos Objetos ativos de `ACTIVITY DOMAIN` — Owner de Domain Layer confirmado é exclusivamente `PROJECT DOMAIN` (`ENG-0011` item 8, formalizado por `ADR-0016`). Texto original preservado acima (linha riscada), não apagado. A responsabilidade "Tarefas" listada em "Responsável por" **não foi removida** — `Activity Domain` continua responsável por apresentar/consultar tarefas no contexto de agenda e follow-up, mas o faz **por referência ao `Task` de `Project Domain` por id**, nunca por posse própria (mesmo padrão de `Identity`/`Organization` como Open Host Service). Nenhum Entity, Aggregate ou Value Object foi criado por esta nota.

---

PROJECT DOMAIN

Responsável por:

Projetos

Sprint

Roadmap

Backlog

Kanban

Objetos

Project

Epic

Story

Task ✅ *(Owner confirmado — `ADR-0016`, ENG-0027/ENG-0028; único domínio com `Task` nos Objetos ativos)*

Sprint

Milestone

Release

⚠️ **Nota (ENG-0028)**: o termo `Task` aqui **não é o mesmo conceito** da hierarquia de planejamento de produto `Epic → Feature → Story → Task → Subtask` de [`BACKLOG.md`](BACKLOG.md) — sobreposição de nome já registrada (`UBIQUITOUS_LANGUAGE.md`, `ADR-0016`), **não resolvida por esta missão**, documentada aqui apenas como preocupação futura. Também não resolvida: se `Task` é Entity interna de `Project` ou Aggregate Root próprio (`AGGREGATE_DISCOVERY.md § 3`, `Aggregate Pending Discovery`).

---

MARKETING DOMAIN

Responsável por:

Campanhas

Landing Pages

SEO

Conteúdo

Social Media

Objetos

Campaign

Landing Page

Asset

Template

Content

Audience

---

~~KNOWLEDGE DOMAIN~~ — REMOVIDO da lista ativa de Business Domains (`ADR-0015`, ENG-0025/ENG-0026)

`Knowledge` é hoje **absorvido pela AI Transversal Intelligence Layer** (`packages/ai/` + `services/kernel/ai-runtime/` + `CONSTITUTION.md Artigo 13`), não um Business Domain — decisão formal, ver `ADR-0015`. Texto original preservado abaixo como histórico, sem alteração de conteúdo. Owner de Domain Layer: N/A para todos os objetos listados (ver `DOMAIN_OWNERSHIP.md`). `Article`/`Playbook`/`Manual`/`Specification` são lidos como conteúdo-fonte da Knowledge Base de IA; `ADR` permanece termo ambíguo, não resolvido por `ADR-0015`.

Responsável por (histórico):

Documentação

Wiki

Playbooks

Artigos

Objetos (histórico — sem Owner de Domain Layer):

Knowledge

Article

Playbook

Manual

Specification

ADR

---

~~AI DOMAIN~~ — REMOVIDO da lista ativa de Business Domains (`ADR-0014`, ENG-0023/ENG-0024)

`AI` é hoje uma **Transversal Intelligence Layer** (`packages/ai/` + `services/kernel/ai-runtime/` + `CONSTITUTION.md Artigo 13`), não um Business Domain — decisão formal, ver `ADR-0014`. Texto original preservado abaixo como histórico, sem alteração de conteúdo. Owner de Domain Layer: N/A para todos os objetos listados (ver `DOMAIN_OWNERSHIP.md`).

Responsável por (histórico):

Agentes

Prompts

Contexto

Memória

Ferramentas

Embeddings

Objetos (histórico — sem Owner de Domain Layer):

Agent

Prompt

Memory

Context

Embedding

Tool

Decision

Insight

Recommendation

---

~~AUTOMATION DOMAIN~~ — REMOVIDO da lista ativa de Business Domains (`ADR-0013`, ENG-0022/ENG-0024)

`Automation` é hoje uma **Platform Capability** (`services/kernel/automation-runtime/`, Infrastructure Capability), não um Business Domain — decisão formal, ver `ADR-0013`. Texto original preservado abaixo como histórico, sem alteração de conteúdo. Owner de Domain Layer: N/A para todos os objetos listados (ver `DOMAIN_OWNERSHIP.md`). **Efeito colateral desta reconciliação**: `Queue` deixa de estar duplicado entre dois Business Domains (violação já registrada em § "Relação com Outros Módulos") — permanece listado apenas em `SYSTEM DOMAIN`, abaixo.

Responsável por (histórico):

Workflows

Triggers

Queues

Execuções

Objetos (histórico — sem Owner de Domain Layer):

Workflow

Automation

Execution

Trigger

Action

Condition

Queue

---

FINANCIAL DOMAIN

Responsável por:

Receitas

Despesas

Pagamentos

Faturamento

Objetos

Invoice

Expense

Payment

Subscription

Billing

Commission

---

ANALYTICS DOMAIN

Responsável por:

KPIs

Métricas

Dashboards

Forecast

Objetos

Dashboard

Widget

Metric

Report

Forecast

Snapshot

Benchmark

---

SYSTEM DOMAIN

Responsável por:

Logs

Integrações

Eventos

Deploy

Observabilidade

Objetos

Audit Log

Event Log

Integration

Webhook

Job

Queue

Release

Migration

Feature Flag

Health Check

> **Nota de Resolução (`ADR-0029`)**: `Release` (Owner definitivo: `Platform/Engineering`, `ENG-0011` item 10) e `Queue` (sem Owner de Domain Layer, reclassificado Infrastructure, `ADR-0013`) estão listados acima como legado — nenhum dos dois pertence ao Domain Layer do System Domain. `Audit Log` é o único objeto desta lista com Owner confirmado e implementado (`Audit`, Kernel). Os demais (`Event Log`, `Integration`, `Webhook`, `Job`, `Migration`, `Feature Flag`, `Health Check`) permanecem formalmente adiados — ver `DOMAIN_OWNERSHIP.md`.

---

# REGRAS

Um domínio nunca acessa tabelas de outro domínio.

Toda comunicação deve ocorrer por:

Eventos

ou

APIs

---

# EVENT BUS

Eventos oficiais

OrganizationCreated

UserInvited

RelationshipCreated

OpportunityCreated

OpportunityWon

ProposalApproved

InvoicePaid

WorkflowExecuted

AgentFinished

KnowledgePublished

---

# DEPENDÊNCIAS

Identity

↓

Workspace

↓

Relationship

↓

Sales

↓

Activity

↓

Project

↓

Marketing

↓

Financial

↓

Analytics

↓

System

Nenhum domínio pode depender de um domínio abaixo dele.

⚠️ **Atualização (ENG-0024, `ADR-0013`/`ADR-0014`)**: `AI` e `Automation` foram removidos desta cadeia — não são Business Domains, não ocupam posição de dependência entre domínios. Ambos são consumidos transversalmente por qualquer domínio da cadeia acima (`AI` como Transversal Intelligence Layer; `Automation` como Platform Capability), sem gerar nem receber dependência de domínio. Cadeia original preservada em espírito — apenas os dois nós removidos, nenhum domínio remanescente reordenado.

⚠️ **Atualização (ENG-0026, `ADR-0015`)**: `Knowledge` também foi removido desta cadeia — absorvido pela AI Transversal Intelligence Layer, não ocupa mais posição de dependência entre domínios. Mesmo tratamento de `AI`/`Automation` acima.

---

# PRINCÍPIO

Alta Coesão

Baixo Acoplamento

Responsabilidade Única

DDD

Clean Architecture

Event Driven

---

FIM

---

## Relação com Outros Módulos

*(Seção adicionada na integração ao repositório. Não faz parte do texto original recebido — o conteúdo acima permanece exatamente como fornecido.)*

⚠️ **Duas violações da própria regra do documento** ("Todo objeto pertence a exatamente um domínio. Nenhum domínio poderá possuir responsabilidades duplicadas."), registradas na versão original:
- ~~`Task` aparece nos objetos de **Activity Domain** e de **Project Domain** simultaneamente~~ — **resolvida (ENG-0028, `ADR-0016`)**: `Task` removido dos Objetos ativos de `ACTIVITY DOMAIN` (linha riscada, preservada como histórico); Owner exclusivo confirmado `PROJECT DOMAIN`. `Activity Domain` consome `Task` por referência de id, nunca por posse — zero duplicação de objeto entre domínios ativos, restando após esta reconciliação.
- ~~`Queue` aparece nos objetos de **Automation Domain** e de **System Domain** simultaneamente~~ — **resolvida como efeito colateral de ENG-0024**: `AUTOMATION DOMAIN` foi removido da lista ativa (`ADR-0013`), seu texto preservado só como histórico. `Queue` permanece ativo unicamente em `SYSTEM DOMAIN` — zero duplicação entre domínios ativos.

**Quinta lista de domínios/produtos desta sessão**, e a primeira organizada por bounded context (DDD) em vez de por produto — não há domínio "CRM" aqui; a funcionalidade de CRM fica distribuída entre Relationship, Sales e Activity. **Confirmado formalmente por `ADR-0011` (ENG-0019)**: `CRM` é exclusivamente Product Layer, nunca Bounded Context — nada a remover deste documento, que já estava correto desde a versão original. Diferente de:
- [NOVARIS_OS.md § 7](NOVARIS_OS.md#7-produtos) — 6 produtos
- [PRODUCTS.md](PRODUCTS.md) / [specifications/](../../specifications/README.md) — 9 produtos
- [ORGANIZATION.md](ORGANIZATION.md) — 10 domínios organizacionais
- [SYSTEM_ARCHITECTURE.md § 5](SYSTEM_ARCHITECTURE.md) — 15 Business Domains

**Camada arquitetural divergente**: aqui `Identity` e `Workspace` são Domains no mesmo nível de `Sales`/`Marketing`/etc.; em [SYSTEM_ARCHITECTURE.md § 3-4](SYSTEM_ARCHITECTURE.md), conceitos equivalentes (Identity, Organizations, ...) fazem parte do **Kernel** (Layer 1, abaixo dos Business Domains).

**Catálogo de objetos diverge de [BOM.md](BOM.md)**: este documento nomeia objetos que não constam no catálogo do BOM — entre eles `IdentityProvider`, `Token`, `Contact`, `Address`, `Phone`, `Email`, `Social Profile`, `Quotation`, `Calendar Event`, `Reminder`, `Checklist`, `Epic`, `Story`, `Milestone`, `Landing Page`, `Template`, `Content`, `Audience`, `Article`, `Manual`, `Execution`, `Action`, `Condition`, `Commission`, `Health Check`. Tanto `BOM.md § 1` quanto [NOVARIS_CONSTITUTION.md Article V](NOVARIS_CONSTITUTION.md) exigem Object Specification antes de qualquer implementação — nenhum destes novos nomes tem uma ainda.

**Product Layer vs. Domain Layer (Missão ENG-0000.2, [ADR-0007](../../adr/ADR-0007-domain-boundaries.md))**: `services/domains/` implementou bounded contexts técnicos a partir de 6 dos 13 domínios listados acima — `Sales`, `Financial`, `Project`, `Marketing`, `Analytics`, e `Relationship` (renomeado para `customer` como nome de bounded context; o texto original de `Relationship Domain` acima não foi alterado). `Identity`/`Workspace` já viram Kernel (nota acima). `Growth` — que nunca foi um domínio deste documento (é produto em [PRODUCTS.md](PRODUCTS.md)) — foi criado por engano como `services/domains/growth/` na Missão ENG-0000.1 e removido nesta missão; ver `ADR-0007` para a distinção formal entre Product Layer (o que a NOVARIS vende) e Domain Layer (bounded contexts técnicos que implementam os produtos).

**Reconciliação de Arquitetura (Missão ENG-0024)**: das 13 seções de domínio originalmente listadas neste documento, **11 permanecem Business Domains ativos** — `Identity`, `Workspace` (Organization), `Relationship` (Customer), `Sales`, `Activity`, `Project`, `Marketing`, `Knowledge`, `Financial`, `Analytics`, `System`. As outras **2 foram formalmente removidas da lista ativa**, com decisão rastreável e texto original preservado como histórico nas próprias seções acima: `AI DOMAIN` → Transversal Intelligence Layer (`ADR-0014`); `AUTOMATION DOMAIN` → Platform Capability (`ADR-0013`). `CRM` nunca foi uma 14ª seção deste documento — sua não-existência como domínio, já afirmada na versão original (parágrafo acima), foi confirmada formalmente por `ADR-0011`, sem necessidade de remoção. A cadeia de `DEPENDÊNCIAS` foi atualizada na mesma missão, removendo os 2 nós correspondentes. Nenhum Entity, Aggregate, Value Object, Domain Event ou Service foi criado por esta reconciliação — só a classificação de domínio já decidida por `ADR-0011`/`ADR-0013`/`ADR-0014` foi refletida no documento canônico.

**Reconciliação de Arquitetura II (Missão ENG-0026)**: das 11 seções de domínio então ativas, **10 permanecem Business Domains ativos** — `Identity`, `Workspace` (Organization), `Relationship` (Customer), `Sales`, `Activity`, `Project`, `Marketing`, `Financial`, `Analytics`, `System`. `KNOWLEDGE DOMAIN` foi formalmente removido da lista ativa, texto original preservado como histórico na própria seção acima — absorvido pela AI Transversal Intelligence Layer (`ADR-0015`). A cadeia de `DEPENDÊNCIAS` recebeu uma segunda atualização, removendo também o nó `Knowledge`. Nenhum Entity, Aggregate, Value Object, Domain Event, Service ou Contract foi criado por esta reconciliação.

## Status

🟢 Oficial (v1.3, reconciliado por ENG-0024, ENG-0026 e ENG-0028). **Zero duplicações de objeto entre domínios ativos** — as duas violações internas originais (`Queue` em `Automation`/`System`, `Task` em `Activity`/`Project`) foram ambas resolvidas (`ADR-0013` via remoção de seção; `ADR-0016`/ENG-0028 via remoção de objeto único). Divergência de catálogo com `BOM.md` segue registrada, não resolvida (fora de escopo). **10 de 13 seções de domínio originais são Business Domains ativos** (`AI`, `Automation` e `Knowledge` removidos da lista ativa, `ADR-0014`/`ADR-0013`/`ADR-0015`; texto histórico preservado nas 3 seções). `ACTIVITY DOMAIN` e `PROJECT DOMAIN` permanecem ativos, sem alteração de status — apenas `Task` foi desduplicado entre eles (`ADR-0016`). `BACKLOG.md`'s hierarquia `Epic→Feature→Story→Task→Subtask` e a pergunta Entity-vs-Aggregate-Root de `Task` permanecem não resolvidas, documentadas como preocupação futura. 6 dos 10 domínios ativos têm bounded context em `services/domains/` (Missão ENG-0000.2).
