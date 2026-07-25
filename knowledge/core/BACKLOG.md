# Backlog Oficial da NOVARIS

> 🗺️ **Planejamento de produto** ([ADR-0008](../../adr/ADR-0008-foundation-freeze.md), Missão ENG-0000.5): este documento responde "o quê construir". O padrão obrigatório de **execução de engenharia** ("como construir") é [NEF/PLANNING_MODEL.md](../../NEF/PLANNING_MODEL.md) (PROGRAM→EPIC→MISSION→TASK→CHECKLIST) — o nível "Epic" abaixo corresponde ao nível EPIC de lá.

> 📖 Hierarquia: **Epic → Feature → Story → Task → Subtask**, cada nível com Dependências, Prioridade, Complexidade, Valor, Sprint e Critério de Aceite (mais `Status`, campo operacional que já existia neste documento).
>
> ⚠️ **Análise da documentação existente**: revisei `NOVARIS_OS.md § 7`, `PRODUCTS.md`, `specifications/` (9 domínios criados por [ADR-0002](../../adr/ADR-0002-reestruturar-arvore-do-repositorio.md)), `ORGANIZATION.md` e `MASTER_ROADMAP.md`. Nenhum deles contém especificação de tela, fluxo de usuário, estimativa de esforço, metodologia de scoring de valor/complexidade, calendário de sprints ou velocidade de time. **Preencher Feature, Story, Task, Subtask, Prioridade, Complexidade, Valor ou Sprint com valores reais agora seria inventar o produto e o planejamento de entrega, não documentá-los** (Constituição, Artigo 13 e Artigo 21). Por isso este backlog é estrutura completa — os 5 níveis existem como esquema navegável — com conteúdo real apenas onde já existe fonte oficial (o nome de cada Epic), e `TODO` em todo o resto.

## Realinhamento do nível Epic

A versão anterior deste backlog usava os 6 produtos de `NOVARIS_OS.md § 7` (Growth, CRM, AI, Automation, Studio, SaaS). Desde então, `PRODUCTS.md` (9 produtos) e os 9 domínios de `specifications/` (Missão 011) convergiram para uma lista diferente. Realinhei os Epics abaixo com `PRODUCTS.md`/`specifications/` — não porque o conflito com `NOVARIS_OS.md § 7` foi resolvido (continua aberto, ver `PROJECT_RULES.md` e `ADR-0002`), mas porque é a lista com mais documentos estruturais já construídos em cima dela.

## Hierarquia e Template de Campos

```
Epic
└── Feature
    └── Story
        └── Task
            └── Subtask
```

Todo item, em qualquer nível, usa este esquema:

| Campo | Descrição | Como preencher |
|---|---|---|
| Dependências | Outros itens ou documentos que precisam existir antes | Aponta para o item pai + documentos de origem (`specifications/<dominio>/*.md`, ADRs) |
| Prioridade | Ordem relativa de execução | **TODO** — requer decisão de negócio, não existe metodologia de priorização registrada ainda |
| Complexidade | Dificuldade técnica estimada | **TODO** — requer especificação técnica (API, banco, componentes) que ainda não existe para nenhum item abaixo de Epic |
| Valor | Valor de negócio estimado | **TODO** — requer metodologia de scoring de valor, não definida em nenhum documento |
| Sprint | Em qual ciclo de entrega o item entra | **TODO** — depende de `MASTER_ROADMAP.md` ganhar granularidade de sprint (hoje só tem Fase 1/Fase 2) e de uma equipe com velocidade conhecida |
| Critério de Aceite | Condição objetiva para considerar o item pronto | **TODO** — nasce da especificação funcional (`specifications/<dominio>/features.md`), ainda não escrita |
| Status | Estado atual do item | `Não iniciado` (padrão até haver trabalho real) |

## Índice de Epics

| Epic | Dependências | Status |
|---|---|---|
| [NOVARIS Growth](#epic-novaris-growth) | `PRODUCTS.md § NOVARIS Growth`, `specifications/growth/` | Não iniciado |
| [NOVARIS CRM](#epic-novaris-crm) | `PRODUCTS.md § NOVARIS CRM`, `specifications/crm/` | Não iniciado |
| [NOVARIS AI](#epic-novaris-ai) | `PRODUCTS.md § NOVARIS AI`, `specifications/ai/`, `AI_STRATEGY.md`, `AI_PLAYBOOK.md` | Não iniciado |
| [NOVARIS Automation](#epic-novaris-automation) | `PRODUCTS.md § NOVARIS Automation`, `specifications/automation/`, `docs/07-automacao/` | Não iniciado |
| [NOVARIS Studio](#epic-novaris-studio) | `PRODUCTS.md § NOVARIS Studio`, `specifications/studio/` | Não iniciado |
| [NOVARIS Analytics](#epic-novaris-analytics) | `PRODUCTS.md § NOVARIS Analytics`, `specifications/analytics/` | Não iniciado |
| [NOVARIS Projects](#epic-novaris-projects) | `PRODUCTS.md § NOVARIS Projects`, `specifications/projects/` | Não iniciado |
| [NOVARIS Marketplace](#epic-novaris-marketplace) | `PRODUCTS.md § NOVARIS Marketplace`, `specifications/marketplace/` | Não iniciado |
| [NOVARIS Financial](#epic-novaris-financial) | `PRODUCTS.md § NOVARIS Financial`, `specifications/financial/` | Não iniciado |

---

## Epic: NOVARIS Growth
- **Dependências**: `ORGANIZATION.md § Growth`, `PRODUCTS.md § NOVARIS Growth`, `specifications/growth/overview.md`
- **Prioridade / Complexidade / Valor / Sprint**: **TODO**
- **Critério de Aceite**: **TODO** — depende de `specifications/growth/features.md`
- **Status**: Não iniciado
- **Features**: 🚧 Nenhuma nomeada ainda. Nasce quando `specifications/growth/features.md` deixar de ser `TODO`.

## Epic: NOVARIS CRM
- **Dependências**: `ORGANIZATION.md § CRM`, `PRODUCTS.md § NOVARIS CRM`, `specifications/crm/overview.md`
- **Prioridade / Complexidade / Valor / Sprint**: **TODO**
- **Critério de Aceite**: **TODO** — depende de `specifications/crm/features.md`
- **Status**: Não iniciado
- **Features**: 🚧 Nenhuma nomeada ainda.

## Epic: NOVARIS AI
- **Dependências**: `ORGANIZATION.md § AI`, `PRODUCTS.md § NOVARIS AI`, `specifications/ai/overview.md`, `AI_STRATEGY.md`, `AI_PLAYBOOK.md`
- **Prioridade / Complexidade / Valor / Sprint**: **TODO**
- **Critério de Aceite**: **TODO** — depende de `specifications/ai/features.md`
- **Status**: Não iniciado
- **Features**: 🚧 Nenhuma nomeada ainda.

## Epic: NOVARIS Automation
- **Dependências**: `ORGANIZATION.md § Automation`, `PRODUCTS.md § NOVARIS Automation`, `specifications/automation/overview.md`, `docs/07-automacao/`
- **Prioridade / Complexidade / Valor / Sprint**: **TODO**
- **Critério de Aceite**: **TODO** — depende de `specifications/automation/features.md`
- **Status**: Não iniciado
- **Features**: 🚧 Nenhuma nomeada ainda.

## Epic: NOVARIS Studio
- **Dependências**: `ORGANIZATION.md § Studio`, `PRODUCTS.md § NOVARIS Studio`, `specifications/studio/overview.md`
- **Prioridade / Complexidade / Valor / Sprint**: **TODO**
- **Critério de Aceite**: **TODO** — depende de `specifications/studio/features.md`
- **Status**: Não iniciado
- **Features**: 🚧 Nenhuma nomeada ainda.

## Epic: NOVARIS Analytics
- **Dependências**: `PRODUCTS.md § NOVARIS Analytics`, `specifications/analytics/overview.md`
- **Prioridade / Complexidade / Valor / Sprint**: **TODO**
- **Critério de Aceite**: **TODO** — depende de `specifications/analytics/features.md`
- **Status**: Não iniciado
- **Features**: 🚧 Nenhuma nomeada ainda. ⚠️ Sem entrada correspondente em `ORGANIZATION.md` (que lista 10 domínios organizacionais, não estes 9 produtos) nem em `NOVARIS_OS.md § 7`.

## Epic: NOVARIS Projects
- **Dependências**: `PRODUCTS.md § NOVARIS Projects`, `specifications/projects/overview.md`
- **Prioridade / Complexidade / Valor / Sprint**: **TODO**
- **Critério de Aceite**: **TODO** — depende de `specifications/projects/features.md`
- **Status**: Não iniciado
- **Features**: 🚧 Nenhuma nomeada ainda. ⚠️ Mesma observação de `NOVARIS Analytics` acima.

## Epic: NOVARIS Marketplace
- **Dependências**: `PRODUCTS.md § NOVARIS Marketplace`, `specifications/marketplace/overview.md`
- **Prioridade / Complexidade / Valor / Sprint**: **TODO**
- **Critério de Aceite**: **TODO** — depende de `specifications/marketplace/features.md`
- **Status**: Não iniciado
- **Features**: 🚧 Nenhuma nomeada ainda. ⚠️ Mesma observação acima; `NOVARIS_OS.md § 7` cita "Marketplace" apenas como parte do Epic "SaaS" (ver nota abaixo), não como produto próprio.

## Epic: NOVARIS Financial
- **Dependências**: `PRODUCTS.md § NOVARIS Financial`, `specifications/financial/overview.md`, `BUSINESS_MODEL.md`
- **Prioridade / Complexidade / Valor / Sprint**: **TODO**
- **Critério de Aceite**: **TODO** — depende de `specifications/financial/features.md`
- **Status**: Não iniciado
- **Features**: 🚧 Nenhuma nomeada ainda. ⚠️ Mesma observação acima; `NOVARIS_OS.md § 7` cita "Financial" apenas como parte do Epic "SaaS", não como produto próprio.

---

## Nota — Epic "NOVARIS SaaS" (removido desta versão)

A versão anterior deste backlog tinha um Epic próprio "NOVARIS SaaS" (Marketplace, API pública, White-Label agrupados), vindo de `NOVARIS_OS.md § 7`. Ele saiu da lista de Epics para não duplicar `Analytics`, `Projects`, `Marketplace` e `Financial`, que agora têm Epic próprio via `PRODUCTS.md`/`specifications/`. Isso **não** resolve o conflito de contagem de produtos (6 vs. 9) — apenas evita registrar a mesma coisa duas vezes neste documento. A decisão formal de qual lista prevalece continua pendente.

## Como um Epic vira Feature → Story → Task → Subtask

Nenhum exemplo abaixo tem conteúdo real — é a estrutura de esquema que cada Epic seguirá quando uma Feature for definida em `specifications/<dominio>/features.md`.

```markdown
### Feature: <nome> (Epic: <epic>)
- Dependências / Prioridade / Complexidade / Valor / Sprint / Critério de Aceite: TODO
- Status: Não iniciado

#### Story: <nome> (Feature: <feature>)
- Dependências / Prioridade / Complexidade / Valor / Sprint / Critério de Aceite: TODO
- Status: Não iniciado

##### Task: <nome> (Story: <story>)
- Dependências / Prioridade / Complexidade / Valor / Sprint / Critério de Aceite: TODO
- Status: Não iniciado

###### Subtask: <nome> (Task: <task>)
- Dependências / Prioridade / Complexidade / Valor / Sprint / Critério de Aceite: TODO
- Status: Não iniciado
```

## Relação com Outros Módulos

- [specifications/](../../specifications/README.md) — fonte de onde Features nascerão, domínio a domínio
- [MASTER_ROADMAP.md](MASTER_ROADMAP.md) — Fase 1/Fase 2 precisam ganhar granularidade de sprint antes que o campo `Sprint` possa ser preenchido para qualquer item
- [MISSING_MODULES.md](MISSING_MODULES.md) — módulos ainda inexistentes que provavelmente viram Epics/Features futuras
- [adr/](../../adr/README.md) — decisões técnicas que surgirem ao detalhar Task/Subtask devem virar ADR, não apenas uma linha de backlog

## Status

🚧 5 níveis de hierarquia estruturados; 9 Epics nomeados a partir de `PRODUCTS.md`/`specifications/`. Feature, Story, Task, Subtask e os campos Prioridade/Complexidade/Valor/Sprint/Critério de Aceite ficam `TODO` em todo o documento — nenhum conteúdo de produto foi inventado.
