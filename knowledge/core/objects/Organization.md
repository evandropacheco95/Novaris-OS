# OBJECT SPECIFICATION

------------------------------------------------------------

OBJECT NAME

Organization

------------------------------------------------------------

DOMAIN

Core

------------------------------------------------------------

VERSION

1.0.0

------------------------------------------------------------

STATUS

Official

------------------------------------------------------------

OWNER

NOVARIS Engineering Team

------------------------------------------------------------

CLASSIFICATION

Core Business Object

------------------------------------------------------------

DESCRIPTION

Organization representa uma empresa, unidade empresarial ou cliente
(SaaS Tenant) dentro da plataforma NOVARIS.

Toda informação existente na plataforma pertence obrigatoriamente a
uma Organization.

Não existe nenhum objeto de negócio sem uma Organization proprietária.

A Organization é o principal mecanismo de isolamento lógico,
segurança, permissões, auditoria e faturamento da plataforma.

Toda a arquitetura Multi-Tenant da NOVARIS gira em torno deste objeto.

============================================================

MISSÃO

Representar uma empresa dentro do ecossistema NOVARIS.

============================================================

RESPONSABILIDADES

✔ Isolamento Multiempresa

✔ Configurações

✔ Plano contratado

✔ Permissões globais

✔ Branding

✔ Billing

✔ Integrações

✔ Auditoria

✔ Feature Flags

✔ IA

✔ Storage

✔ Ambientes

✔ Licenciamento

============================================================

NÃO É RESPONSABILIDADE

Gestão de usuários

CRM

Financeiro

Projetos

Leads

Negócios

Agenda

Marketing

Todas essas responsabilidades pertencem aos módulos específicos.

============================================================

LIFECYCLE

Created

↓

Pending Configuration

↓

Active

↓

Suspended

↓

Archived

↓

Deleted (Soft Delete)

============================================================

STATUS

ACTIVE

SUSPENDED

TRIAL

BLOCKED

ARCHIVED

============================================================

ATRIBUTOS

ID

UUID

PK

------------------------------------------------

slug

Texto

Único

------------------------------------------------

name

Nome Comercial

------------------------------------------------

legal_name

Razão Social

------------------------------------------------

document

CNPJ

------------------------------------------------

state_registration

Inscrição Estadual

------------------------------------------------

municipal_registration

Inscrição Municipal

------------------------------------------------

email

Email principal

------------------------------------------------

phone

Telefone

------------------------------------------------

website

Website

------------------------------------------------

timezone

Timezone

------------------------------------------------

language

Idioma

------------------------------------------------

currency

Moeda

------------------------------------------------

country

País

------------------------------------------------

state

Estado

------------------------------------------------

city

Cidade

------------------------------------------------

zip_code

CEP

------------------------------------------------

address

Endereço

------------------------------------------------

number

Número

------------------------------------------------

district

Bairro

------------------------------------------------

complement

Complemento

------------------------------------------------

logo_url

Logo

------------------------------------------------

favicon_url

Favicon

------------------------------------------------

primary_color

Cor principal

------------------------------------------------

secondary_color

Cor secundária

------------------------------------------------

accent_color

Cor destaque

------------------------------------------------

plan

Plano

Starter

Growth

Business

Enterprise

------------------------------------------------

billing_status

Status financeiro

------------------------------------------------

trial_end

Fim do Trial

------------------------------------------------

max_users

Número máximo usuários

------------------------------------------------

max_storage

Armazenamento máximo

------------------------------------------------

storage_used

Uso armazenamento

------------------------------------------------

feature_flags

JSON

------------------------------------------------

settings

JSON

------------------------------------------------

metadata

JSON

------------------------------------------------

created_at

updated_at

deleted_at

============================================================

RELACIONAMENTOS

Organization

↓

Users

Teams

Pipelines

Dashboards

Projects

Campaigns

Assets

Files

CRM

AI

Automation

Financial

Marketplace

Knowledge

Analytics

Todas as tabelas da plataforma deverão possuir organization_id.

============================================================

EVENTOS

OrganizationCreated

OrganizationActivated

OrganizationUpdated

OrganizationSuspended

OrganizationPlanChanged

OrganizationBillingFailed

OrganizationArchived

OrganizationDeleted

============================================================

PERMISSÕES

organization.read

organization.create

organization.update

organization.delete

organization.manage_users

organization.manage_billing

organization.manage_integrations

organization.manage_ai

organization.manage_settings

============================================================

REGRAS DE NEGÓCIO

RN001

Toda informação pertence obrigatoriamente a uma Organization.

RN002

Nenhuma consulta pode retornar dados de outra Organization.

RN003

Toda API deve validar organization_id.

RN004

Toda tabela obrigatoriamente possui organization_id.

RN005

Soft Delete obrigatório.

RN006

Auditoria obrigatória.

RN007

Feature Flags são definidas por Organization.

RN008

Integrações pertencem à Organization.

RN009

Storage pertence à Organization.

RN010

O Billing pertence à Organization.

============================================================

RLS (ROW LEVEL SECURITY)

Todas as consultas devem respeitar:

organization_id = auth.organization_id

Nenhum usuário acessa outra empresa.

============================================================

API

GET

/organizations

------------------------------------------------

GET

/organizations/:id

------------------------------------------------

POST

/organizations

------------------------------------------------

PATCH

/organizations/:id

------------------------------------------------

DELETE

/organizations/:id

------------------------------------------------

POST

/organizations/:id/suspend

------------------------------------------------

POST

/organizations/:id/activate

------------------------------------------------

POST

/organizations/:id/change-plan

============================================================

AUTOMAÇÕES

Quando criada:

↓

Criar Workspace padrão

↓

Criar Admin

↓

Criar Team padrão

↓

Criar Pipeline padrão

↓

Criar Dashboard padrão

↓

Criar Configurações

↓

Criar Storage

↓

Criar Ambiente IA

↓

Criar Ambiente Automation

↓

Criar Logs

↓

Criar Auditoria

============================================================

IA

Toda IA recebe Organization como contexto obrigatório.

Contexto mínimo:

Organization ID

Plano

Idioma

Timezone

Feature Flags

Permissões

Configurações

Branding

============================================================

AUDITORIA

Toda alteração deverá registrar:

Usuário

Data

IP

Origem

Evento

Valores antigos

Valores novos

============================================================

LOGS

Todos os acessos

Todas alterações

Todas integrações

Todas APIs

Todos uploads

Todas automações

============================================================

KPIs

Quantidade de usuários

Uso armazenamento

Quantidade Leads

Quantidade Clientes

Quantidade IA

Quantidade Automações

Quantidade Projetos

Receita

MRR

ARR

Uso API

============================================================

DEPENDÊNCIAS

Identity

Authentication

Billing

Permissions

Storage

Audit

Feature Flags

Analytics

============================================================

FUTURAS EVOLUÇÕES

Organizações em árvore

Múltiplas filiais

Organizações compartilhadas

White Label

Marketplace

Organizações Globais

Ambientes separados

Regiões de dados

Compliance LGPD/GDPR

============================================================

DEFINITION OF DONE

✔ Banco

✔ APIs

✔ Frontend

✔ Backend

✔ IA

✔ Eventos

✔ Auditoria

✔ Logs

✔ Testes

✔ Documentação

✔ Changelog

✔ ADR

============================================================

FIM DO OBJETO ORGANIZATION

---

## Relação com Outros Módulos

*(Seção adicionada na integração ao repositório. Não faz parte do texto original recebido.)*

- [BOM.md § 4 Core Objects — Organization](../BOM.md) — entrada catalogada que esta especificação detalha
- [OBJECT_SPECIFICATION_TEMPLATE.md](../OBJECT_SPECIFICATION_TEMPLATE.md) — template do qual esta é a primeira instância real
- [architecture/multi-tenancy.md](../../../architecture/multi-tenancy.md) — hoje `TODO`; RN001-RN004 e a seção RLS aqui passam a ser a fonte substantiva do modelo de isolamento multi-tenant
- [docs/02-produto/precos-e-planos.md](../../../docs/02-produto/precos-e-planos.md) — hoje `TODO`; o atributo `plan` (Starter/Growth/Business/Enterprise) é a primeira definição real de níveis de plano em todo o repositório
- [knowledge/core/BUSINESS_MODEL.md](../BUSINESS_MODEL.md) — hoje `TODO`; os KPIs `MRR`/`ARR` aqui listados pertencem a esse documento quando for preenchido
- [engineering/playbooks/create-automation.md](../../../engineering/playbooks/create-automation.md) — hoje `TODO`; a cadeia de automações de provisionamento (Workspace → Admin → Team → Pipeline → Dashboard → ...) é o primeiro exemplo concreto de automação de todo o repositório

## Status

🟢 Official (v1.0.0) — primeira instância real de `OBJECT_SPECIFICATION_TEMPLATE.md`, referente ao objeto `Organization` de `BOM.md`.
