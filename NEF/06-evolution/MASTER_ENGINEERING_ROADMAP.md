# MASTER_ENGINEERING_ROADMAP.md

Versão: 1.0.0

Status: Oficial

---

## Objetivo

Sequência de fases da evolução completa da plataforma NOVARIS, do ponto de vista de engenharia — dada explicitamente pela Ordem de Missão NEF-001.

## ✅ Nota de Consolidação (resolvida por ENG-0000.5)

Este era o **terceiro** documento de roadmap mestre do repositório. [ADR-0008](../../adr/ADR-0008-foundation-freeze.md) (Missão ENG-0000.5, Foundation Freeze) resolveu:

- **Este documento** — roadmap mestre único e canônico da plataforma (12 fases).
- [knowledge/core/IMPLEMENTATION_ROADMAP.md](../../knowledge/core/IMPLEMENTATION_ROADMAP.md) — reclassificado como roadmap **especializado**, subordinado a este (sequenciamento interno Kernel→Domínios da fase Foundation).
- [knowledge/core/MASTER_ROADMAP.md](../../knowledge/core/MASTER_ROADMAP.md) — reclassificado como **histórico**, substituído por este documento.

As três sequências **não são idênticas** entre si (ordem, granularidade e nome das fases diferem). Nenhuma foi reescrita para bater com as outras.

## Sem Datas

Mesma disciplina de `MASTER_ROADMAP.md` e `IMPLEMENTATION_ROADMAP.md`: nenhum documento tem dado de equipe ou velocidade para estimar prazo — datas não são inventadas aqui.

## Fases

| # | Fase | Estado Atual |
|---|---|---|
| 1 | Foundation | 🟢 Concluída — Kernel estruturado (ARCH-001/ENG-0000), banco/dados/linguagem documentados (ARCH-002 a 005), monorepo real (ENG-0000/0000.1/0000.2), Engineering Playbook (ENG-0000.3), este framework (NEF-001), Foundation Freeze e governança consolidada (ENG-0000.5, [ADR-0008](../../adr/ADR-0008-foundation-freeze.md)). Ver [FOUNDATION_STATUS.md](../../FOUNDATION_STATUS.md). |
| 2 | Core Platform | 🟢 Concluída como infraestrutura técnica — `identity`/`organizations`/`audit` (`services/kernel/`) implementados de ponta a ponta (Domain/Application/Infrastructure/API/Frontend), incluindo RBAC granular por rota (`ADR-0036`, `ENG-0136`) sobre `AuthorizationDomainService`. **Atualização (`ENG-0142`, `ADR-0041`)**: **os 20 módulos de Kernel têm hoje disposição final** — 3 Domain Capabilities (`identity`/`organizations`/`audit`) + 11 Infrastructure Capabilities reais e totalmente funcionais (`event-bus`/`logging`/`scheduler`/`monitoring`/`notifications`/`search`/`configuration`/`feature-flags`/`files`/`realtime`/`automation-runtime` — este último inspirado no Salesforce Flow, verificado ao vivo com um webhook HTTP real recebendo um evento `UserCreated`) + 2 Infrastructure Capabilities estruturais (`integration-hub`, WhatsApp/Meta/Bling/Google; `ai-runtime`, inspirado no Salesforce Einstein Copilot — nenhuma credencial de terceiro existe para nenhum dos 2, `loggedOnly: true` em toda resposta) + 1 sem implementação por decisão explícita (`storage`, falta regra de cota/plano) + 3 históricos sem capacidade própria (`permissions`/`roles`/`users`, absorvidos por `identity`). **Desvio de ordem** (`IMPLEMENTATION_ROADMAP.md § 3`): Kernel Fase A deveria anteceder qualquer Domínio de negócio; na prática os 10 Business Domains foram implementados antes — fato registrado (nota de 2026-07-24 abaixo), não desfeito, lacuna de fundação fechada retroativamente em `ENG-0139`/`ENG-0140`/`ENG-0141`/`ENG-0142`. |
| 3 | CRM | 🟡 Parcial (Domain Layer) — `Sales`/`Relationship` (`services/domains/sales`, `customer`) implementados de ponta a ponta e expostos via `apps/api`/`apps/web` (`ENG-0120`-`0126`). `Activity`/`Marketing` (`ENG-0133`) também prontos e tecnicamente adjacentes a este produto. **Product Layer não iniciado** — `PRODUCTS.md § NOVARIS CRM` segue 100% `TODO` (Objetivo/Escopo/Funcionalidades/KPIs/Roadmap nunca escritos); não existe pacote/experiência "CRM" que monte esses domínios como produto coeso. **Nota (`ENG-0142`)**: o CTO deu a diretriz de usar a estrutura do Salesforce (o próprio CRM de referência do mercado) como modelo para áreas do NOVARIS ainda sem estrutura — aplicada primeiro a `ai-runtime`/`automation-runtime` (Kernel). **Atualização (`ENG-0143`, `ADR-0042`)**: primeira aplicação da diretriz dentro de um Business Domain — `Lead` (Sales) adaptado do Lead-to-Convert do Salesforce, com `ConvertLeadHandler` compondo `Sales`→`Customer` (cria `Party` real) e opcionalmente `Sales`→`Sales` (`Opportunity`), primeira criação real (não só referência por id) de um Aggregate de outro domínio nesta plataforma. `POST/GET /leads`, `/leads/:id/status`, `/leads/:id/convert`; Frontend `/leads`. Verificado ao vivo contra Postgres real. **Atualização (`ENG-0144`, `ADR-0043`)**: 3 novas adaptações — `Product`+`Quotation` (Sales, preenche a lacuna de `Quotation` reservada desde `ADR-0020`) e `Case` (Activity, Service Cloud). `Comment` (Activity, Chatter) também implementado, resolvendo a deferral de `ENG-0132`. 4 novos Aggregates, 4 novas rotas de API (`/products`, `/quotations`, `/cases`, `/comments`), 4 novas telas. Verificado ao vivo: preço de `Product` corretamente resolvido em tempo real por `QuotationLineItem` (não um valor stale). **Atualização (`ENG-0145`, `ADR-0044`)**: `Contract` — último objeto oficial do Sales Domain com posição resolvida (exceto `Revenue`), gerado exclusivamente a partir de uma `Quotation` `accepted` (`POST /quotations/:id/generate-contract`), ciclo `draft→active→terminated`. Verificado ao vivo, incluindo o bloqueio correto (400) ao tentar gerar Contract de uma Quotation ainda `draft`. **Atualização (`ENG-0146`, `ADR-0045`)**: `CalendarEvent`/`Reminder`/`Checklist` — últimos 3 objetos oficiais do Activity Domain, antes bloqueados por falta de campos mínimos (`ACTIVITY_AGGREGATE_DESIGN.md § 9`). Fecha 100% do Activity Domain. |
| 4 | AI | 🟡 Parcial (Kernel, estrutural) — `packages/ai/` estruturado (ENG-0000.1). **Atualização (`ENG-0142`, `ADR-0041`)**: `services/kernel/ai-runtime/` ganhou código real (Port `AIRuntime` + `ConsoleAIRuntime`, inspirado no Salesforce Einstein Copilot) — mas nenhuma chamada real a um modelo de IA acontece (`OPENAI_API_KEY`/`ANTHROPIC_API_KEY` seguem vazias). `PRODUCTS.md § NOVARIS AI` 100% `TODO` — Product Layer não iniciado. |
| 5 | Automation | 🟡 Parcial (Kernel, real) — **Atualização (`ENG-0142`, `ADR-0041`)**: `services/kernel/automation-runtime/` implementado de ponta a ponta, inspirado no Salesforce Flow (gatilho sobre o Event Bus + ações `log`/`notify`/`webhook`, configurável via API em runtime) — verificado ao vivo. `services/kernel/scheduler/` (`ADR-0039`) e `services/kernel/integration-hub/` (`ADR-0040`, WhatsApp/Meta/Bling/Google) também têm código real — infraestrutura técnica adjacente a este produto, não o produto em si. `PRODUCTS.md § NOVARIS Automation` 100% `TODO` — Product Layer não iniciado. |
| 6 | Financial | 🟡 Parcial (Domain Layer) — domínio `financial` (`Invoice`/`Subscription`) implementado de ponta a ponta (`ENG-0131`). **Product Layer não iniciado** — `PRODUCTS.md § NOVARIS Financial` 100% `TODO`. |
| 7 | Projects | 🟡 Parcial (Domain Layer) — domínio `projects` (`Project`/`Task`) implementado de ponta a ponta (`ENG-0130`). **Product Layer não iniciado** — `PRODUCTS.md § NOVARIS Projects` 100% `TODO`. |
| 8 | Analytics | 🟡 Parcial (Domain Layer) — domínio `analytics` (`Dashboard`) implementado de ponta a ponta (`ENG-0133`); `Widget` deliberadamente bloqueado (`ADR-0034`, sem caso de uso real ainda). **Product Layer não iniciado** — `PRODUCTS.md § NOVARIS Analytics` 100% `TODO`. |
| 9 | Marketplace | 🔴 Não iniciado — nenhum domínio ou serviço estruturado ainda; provável caso de Product Layer sem bounded context próprio, mesmo padrão de `Growth` ([ADR-0007](../../adr/ADR-0007-domain-boundaries.md)) |
| 10 | Public API | 🟡 Parcial, com ressalva — `apps/api/` implementado de ponta a ponta: os 10 Business Domains oficiais expostos via REST (48 rotas), autenticação JWT, RBAC granular por rota. **Mas é a API interna consumida pelo próprio `apps/web`** (sessão de usuário, sem API key/rate limiting/versionamento) — ainda não é a "API Pública" voltada a desenvolvedores externos que esta fase e a Fase 12 preveem; essa distinção não foi resolvida em nenhuma fonte. |
| 11 | White Label | 🔴 Não iniciado — mencionado em `NOVARIS_OS.md § 7` como parte de "NOVARIS SaaS"; nenhuma estrutura própria ainda |
| 12 | Developer Platform | 🔴 Não iniciado — `packages/sdk/`, `docs/13-portal-do-desenvolvedor/` estruturados, sem implementação |

Ordem sequencial — nenhuma fase começa antes da anterior atingir seu critério de saída (mesmo princípio de [IMPLEMENTATION_ROADMAP.md § 5](../../knowledge/core/IMPLEMENTATION_ROADMAP.md)). **Nota (2026-07-24)**: as Fases 3/6/7/8 foram concluídas tecnicamente (Domain Layer) fora de ordem em relação à Fase 2 (ainda parcial) — a sequência estrita não foi seguida à risca; registrado como fato, não corrigido retroativamente.

## Relação com Outros Módulos

- [knowledge/core/IMPLEMENTATION_ROADMAP.md](../../knowledge/core/IMPLEMENTATION_ROADMAP.md) — plano de execução técnica do Kernel/domínios que a Fase 2 (Core Platform) desta sequência consome
- [knowledge/core/MASTER_ROADMAP.md](../../knowledge/core/MASTER_ROADMAP.md) — roadmap de produto por fase (`NOVARIS_OS.md`)
- [PROJECT_RULES.md](../../PROJECT_RULES.md) — registro do conflito de três roadmaps

## Status

🟢 Oficial (v1.0.0). Fases dadas pela Ordem de Missão NEF-001; estado atual de cada uma é real, verificado contra o repositório, não inventado.
