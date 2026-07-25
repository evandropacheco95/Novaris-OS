# Módulos Faltantes (Missão 005)

> 📖 Lista de nomes de módulo extraída de documentos já existentes ([MONOREPO_ARCHITECTURE.md](MONOREPO_ARCHITECTURE.md), [PRODUCTS.md](PRODUCTS.md), auditoria de documentos faltantes) — nenhum módulo novo foi inventado.
>
> ⚠️ **Ordenação**: você pediu "do mais importante para o menos importante". Não há critério de valor de negócio definido em nenhum documento para ordenar dessa forma sem inventar. A ordem abaixo é por **dependência estrutural** (o que outros módulos precisam para existir primeiro), não por importância de negócio — isso fica explicitamente `TODO` em cada item.

## Documentos de Arquitetura Referenciados e Ainda Ausentes

### CRM_ARCHITECTURE.md
- **Objetivo**: **TODO**
- **Prioridade**: **TODO**
- **Complexidade**: **TODO**
- **Dependências**: `ORGANIZATION.md § CRM` (recém-criado, ainda estrutura)
- **Esforço estimado**: **TODO**
- **Valor para o negócio**: **TODO**

### DATABASE_ARCHITECTURE.md
- **Objetivo**: **TODO**
- **Prioridade**: **TODO**
- **Complexidade**: **TODO**
- **Dependências**: `architecture/modelagem-de-dados.md` (já existe, `TODO`)
- **Esforço estimado**: **TODO**
- **Valor para o negócio**: **TODO**

### AI_ARCHITECTURE.md
- **Objetivo**: **TODO**
- **Prioridade**: **TODO**
- **Complexidade**: **TODO**
- **Dependências**: `AI_STRATEGY.md`, `AI_PLAYBOOK.md` (ambos existem, `TODO`)
- **Esforço estimado**: **TODO**
- **Valor para o negócio**: **TODO**

## Pacotes Compartilhados Propostos (de MONOREPO_ARCHITECTURE.md, nenhum implementado)

### packages/ui (Design System)
- **Objetivo**: **TODO**
- **Prioridade**: **TODO**
- **Complexidade**: **TODO**
- **Dependências**: nenhuma — base para os demais
- **Esforço estimado**: **TODO**
- **Valor para o negócio**: **TODO**

### packages/database
- **Objetivo**: **TODO**
- **Prioridade**: **TODO**
- **Complexidade**: **TODO**
- **Dependências**: `DATABASE_ARCHITECTURE.md`
- **Esforço estimado**: **TODO**
- **Valor para o negócio**: **TODO**

### packages/auth
- **Objetivo**: **TODO**
- **Prioridade**: **TODO**
- **Complexidade**: **TODO**
- **Dependências**: `packages/database`
- **Esforço estimado**: **TODO**
- **Valor para o negócio**: **TODO**

### packages/ai-core
- **Objetivo**: **TODO**
- **Prioridade**: **TODO**
- **Complexidade**: **TODO**
- **Dependências**: `AI_ARCHITECTURE.md`
- **Esforço estimado**: **TODO**
- **Valor para o negócio**: **TODO**

### packages/automation-core
- **Objetivo**: **TODO**
- **Prioridade**: **TODO**
- **Complexidade**: **TODO**
- **Dependências**: `docs/07-automacao/`
- **Esforço estimado**: **TODO**
- **Valor para o negócio**: **TODO**

### packages/sdk
- **Objetivo**: **TODO**
- **Prioridade**: **TODO**
- **Complexidade**: **TODO**
- **Dependências**: `packages/auth`, `docs/13-portal-do-desenvolvedor/`
- **Esforço estimado**: **TODO**
- **Valor para o negócio**: **TODO**

## Apps (Produtos) — de MONOREPO_ARCHITECTURE.md, nenhum implementado

> ⚠️ Nomes dependem da resolução do conflito de lista de produtos (6 em `NOVARIS_OS.md § 7` vs. 9 em `PRODUCTS.md`) — listados aqui conforme `MONOREPO_ARCHITECTURE.md`, que já usa a lista de 6.

### apps/web (shell principal)
- **Objetivo**: **TODO**
- **Prioridade**: **TODO**
- **Complexidade**: **TODO**
- **Dependências**: `packages/ui`, `packages/auth`, `packages/database`
- **Esforço estimado**: **TODO**
- **Valor para o negócio**: **TODO**

### apps/growth, apps/crm, apps/ai, apps/automation, apps/studio, apps/saas-admin
- **Objetivo**: **TODO** (um por app)
- **Prioridade**: **TODO**
- **Complexidade**: **TODO**
- **Dependências**: `apps/web` e os pacotes compartilhados correspondentes
- **Esforço estimado**: **TODO**
- **Valor para o negócio**: **TODO**

## Status

🚧 Estrutura criada. Nenhuma prioridade, complexidade, esforço ou valor de negócio foi inventado — todos os campos de julgamento ficam `TODO` até haver decisão real.
