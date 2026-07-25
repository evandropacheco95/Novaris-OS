# SYSTEM_ARCHITECTURE.md

Versão 1.1

Status: Oficial

Autoridade: Chief System Architect

Nota: § 2 anotada (não reescrita) por [ADR-0023](../../adr/ADR-0023-company-identity-statement-consolidation.md) — `CONSTITUTION.md` Artigo 4 é a Visão oficial vinculante da empresa.

---

# 1. Objetivo

Este documento define a arquitetura oficial da plataforma NOVARIS OS.

Toda implementação deverá seguir esta arquitetura.

Nenhum módulo poderá fugir deste padrão.

---

# 2. Visão Geral

> **Nota de Resolução (ADR-0023)**: a Visão oficial e vinculante da empresa é `CONSTITUTION.md` Artigo 4 (emendado por `ADR-0022`); a identidade oficial do produto é o Artigo 2 ("Intelligent Operating Platform"). O texto abaixo é preservado verbatim como descrição arquitetural, não é a formulação de referência em caso de divergência.

NOVARIS é um Enterprise Operating System (EOS).

Não é apenas um CRM.

É uma plataforma composta por diversos domínios independentes que compartilham uma infraestrutura comum.

Toda funcionalidade pertence a um domínio.

Todo domínio utiliza o mesmo Kernel.

---

# 3. Arquitetura em Camadas

A plataforma é dividida em quatro camadas.

Layer 1

Kernel

↓

Layer 2

Business Domains

↓

Layer 3

Integration Layer

↓

Layer 4

Infrastructure

---

# 4. Kernel

O Kernel concentra tudo que é compartilhado.

## Domínios do Kernel

Identity

Organizations

Permissions

Authentication

Notifications

Audit

Storage

Configuration

Events

AI Runtime

Automation Runtime

Search

Analytics Core

Logging

Monitoring

Feature Flags

Secrets

Scheduler

Realtime

Files

SDK

Todos os demais módulos utilizam o Kernel.

Nenhum domínio replica funcionalidades do Kernel.

---

# 5. Business Domains

> **Nota de Resolução (ADR-0024)**: a contagem oficial de Business Domains é **10**, confirmada por `DOMAIN_MODEL.md` (`Identity`, `Organization`, `Relationship`/`Customer`, `Sales`, `Activity`, `Project`, `Marketing`, `Financial`, `Analytics`, `System`). A lista de 15 abaixo mistura, sem distinção, nomes já resolvidos como Product Layer (`CRM`, `Growth`, `Studio`, `Marketplace`), Infrastructure/Transversal (`Automation`, `AI`, `Knowledge`) e nomes nunca avaliados (`Customer Success`, `Support`, `HR`). Preservada verbatim como registro histórico.

Cada domínio representa uma área de negócio.

Domínios oficiais:

CRM

Growth

Marketing

Sales

Projects

Financial

Studio

Analytics

Automation

AI

Marketplace

Customer Success

Support

HR (futuro)

Knowledge

Cada domínio possui:

- Banco lógico
- APIs
- Eventos
- Permissões
- KPIs
- Automações
- Agentes
- Relatórios

---

# 6. CRM

Responsabilidades:

Gestão de Leads

Negócios

Pipeline

Agenda

Follow-up

Clientes

Propostas

Contratos

Documentos

Comissões

Kanban

Metas

Dashboards

---

# 7. Growth

Diagnóstico

Planejamento

OKRs

KPIs

Consultoria

Performance

Playbooks

Treinamentos

Roadmaps

---

# 8. Studio

Landing Pages

Sites

Portais

Templates

CMS

Assets

SEO

Blog

---

# 9. AI

Agentes

Context Engineering

RAG

Prompt Library

Knowledge Base

Memória

Ferramentas

Modelos

Orquestração

Observabilidade

---

# 10. Automation

Workflows

Triggers

Queues

Cron

Integrações

Eventos

Webhooks

---

# 11. Financial

Receitas

Despesas

Fluxo de Caixa

Cobranças

Notas

Comissões

Integrações ERP

---

# 12. Marketplace

Marketplace de Apps

Marketplace de IA

Marketplace de Templates

Marketplace de Integrações

---

# 13. Communication

Todos os módulos comunicam-se através de eventos.

Nunca através de acesso direto ao banco de outro domínio.

Exemplos:

LeadCreated

DealWon

TaskCompleted

InvoicePaid

AutomationExecuted

AgentFinished

---

# 14. API Gateway

Toda comunicação externa passa pelo Gateway.

Responsabilidades:

Autenticação

Autorização

Rate Limit

Versionamento

Logs

Monitoramento

---

# 15. Banco de Dados

Banco único.

Separação lógica por domínio.

Padrões:

UUID

Soft Delete

Audit

Timestamps

RLS

Migrations

Views

RPCs

Policies

Indexes

---

# 16. Event Bus

Todo evento é registrado.

Estrutura:

ID

Tipo

Origem

Destino

Payload

Timestamp

Status

Correlation ID

---

# 17. Integrações

Meta

WhatsApp

Google

Microsoft

OpenAI

Anthropic

Gemini

NVIDIA

Stripe

Asaas

Mercado Pago

Bling

RD Station

HubSpot

Zapier

Make

n8n

---

# 18. IA

Toda IA acessa dados através do AI Runtime.

Nunca diretamente.

Responsabilidades:

Contexto

Permissões

Memória

Ferramentas

Logs

Segurança

---

# 19. Multiempresa

Toda tabela deverá possuir:

organization_id

Nenhum dado poderá ser compartilhado entre empresas sem autorização explícita.

---

# 20. Segurança

Obrigatório:

RLS

JWT

RBAC

Criptografia

Auditoria

Logs

---

# 21. Observabilidade

Logs

Métricas

Tracing

Eventos

Health Checks

Alertas

---

# 22. Escalabilidade

Toda arquitetura deverá suportar:

100 empresas

1.000 empresas

10.000 empresas

100.000 empresas

Sem reescrita estrutural.

---

# 23. Organização do Monorepo

/apps

/packages

/services

/sdk

/database

/docs

/specifications

/NES

/adr

/scripts

/tools

/tests

/design-system

/infrastructure

---

# 24. Fluxo Oficial

Ideia

↓

Specification

↓

ADR

↓

Planejamento

↓

Implementação

↓

Testes

↓

Deploy

↓

Monitoramento

↓

Documentação

---

# 25. Regras Arquiteturais

Domínios não acessam banco de outros domínios.

Toda comunicação ocorre via APIs ou eventos.

Toda alteração gera documentação.

Toda decisão estrutural gera ADR.

Toda funcionalidade nasce de uma SPEC.

Todo código deve possuir responsável.

Toda tabela deve possuir owner.

Todo evento deve possuir contrato.

Toda API deve possuir documentação.

Toda tela deve possuir Specification.

---

# 26. Roadmap Técnico

Fase 1

Kernel

Identity

Organizations

Permissions

Authentication

Audit

Storage

---

Fase 2

CRM

Growth

Studio

AI

Automation

---

Fase 3

Analytics

Marketplace

Financial

Customer Success

---

Fase 4

Marketplace Público

API Pública

SDK

Developer Portal

---

# 27. Definição de Arquitetura Oficial

A arquitetura da NOVARIS é baseada em:

Domain Driven Design

Clean Architecture

Event Driven Architecture

Modular Monolith (inicial)

Microservices (quando necessário)

CQRS (casos específicos)

SOLID

Clean Code

Twelve Factor App

OpenTelemetry

REST + Realtime

---

FIM

---

## Relação com Outros Módulos

*(Seção adicionada na integração ao repositório. Não faz parte do texto original recebido — os 27 capítulos acima permanecem exatamente como fornecidos.)*

- [NOVARIS_OS.md § 8 Arquitetura Geral](NOVARIS_OS.md#8-arquitetura-geral) — descreve um fluxo de camadas diferente (Frontend → Backend → Supabase → Edge Functions → Storage → IA → Automações → Dashboards) do modelo de 4 camadas (Kernel → Business Domains → Integration Layer → Infrastructure) deste documento
- [NES/README.md](../../NES/README.md) — "Documento Mestre de Engenharia"; § Capítulo 6 define um fluxo de engenharia de 6 etapas, diferente do § 24 "Fluxo Oficial" deste documento (9 etapas) e das 11 fases de `.command-center/EXECUTION_PROTOCOL.md`
- [architecture/](../../architecture/README.md) — pasta de topo já existente para arquitetura de sistema (criada por [ADR-0002](../../adr/ADR-0002-reestruturar-arvore-do-repositorio.md)); este documento e aquela pasta cobrem o mesmo tema com nomes quase idênticos
- [knowledge/core/MASTER_ROADMAP.md](MASTER_ROADMAP.md) — roadmap de 2 fases derivado de `NOVARIS_OS.md § 19`; § 26 deste documento define um roadmap de 4 fases, com conteúdo diferente
- [knowledge/core/ORGANIZATION.md](ORGANIZATION.md), [knowledge/core/PRODUCTS.md](PRODUCTS.md), [specifications/](../../specifications/README.md) — § 5 deste documento lista 15 Business Domains (inclui Marketing, Sales, Support, HR, Knowledge — nenhum presente nas listas anteriores), diferente dos 6 produtos de `NOVARIS_OS.md § 7`, dos 9 de `PRODUCTS.md`/`specifications/`, e dos 10 domínios organizacionais de `ORGANIZATION.md`
- [specs/](../../specs/README.md) — § 25 declara "Toda funcionalidade nasce de uma SPEC", reforçando (sem resolver) o conflito já registrado entre `specs/` e `specifications/`
- Ver nota completa de conflitos em [PROJECT_RULES.md](../../PROJECT_RULES.md)

## Status

🟢 Oficial (v1.0). Conflitos com outros documentos de governança registrados, não resolvidos.
