# Services / Kernel

## Objetivo

Concentrar tudo que é compartilhado entre os domínios de negócio da NOVARIS — nenhum domínio replica funcionalidades do Kernel, e nenhum domínio acessa outro módulo diretamente, só pela interface pública ([SYSTEM_ARCHITECTURE.md § 4](../../knowledge/core/SYSTEM_ARCHITECTURE.md), [NOVARIS_CONSTITUTION.md Article IV](../../knowledge/core/NOVARIS_CONSTITUTION.md)).

Construído como serviços NestJS com deploy próprio — ver [ADR-0004](../../adr/ADR-0004-mover-kernel-para-services.md) (move o Kernel de `packages/kernel/` para `services/`) e [ADR-0005](../../adr/ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md) (stack de backend). Separado de [services/domains/](../domains/README.md) por [ADR-0006](../../adr/ADR-0006-monorepo-structure-decision.md) (Missão ENG-0000.1) — Kernel e Business Domains não vivem mais no mesmo nível.

⚠️ **Esclarecimento (Missão ENG-0002.3)**: ADR-0005 decide a stack de backend do serviço como um todo (Infrastructure/Interface Layer). A Domain Layer de cada módulo (`src/domain/`) é framework-agnóstica por Clean Architecture ([ENGINEERING_PLAYBOOK.md § 1-2](../../knowledge/engineering/ENGINEERING_PLAYBOOK.md)) — não depende de NestJS, nem deve. `identity/` é o primeiro exemplo real disso: `package.json`/`tsconfig.json` TypeScript puro, sem NestJS, consistente com a arquitetura já documentada, não um desvio dela.

## Escopo desta Missão (ARCH-001, migrado por ENG-0000, reorganizado por ENG-0000.1)

Só os 20 módulos abaixo, só infraestrutura — nenhuma funcionalidade de CRM, Leads, Clientes ou outro módulo de negócio.

## Módulos e Fases de Implementação

| Fase | Módulos |
|---|---|
| A — Fundação | [logging/](logging/README.md), [event-bus/](event-bus/README.md) |
| B — Identidade | [identity/](identity/README.md), [organizations/](organizations/README.md), [users/](users/README.md) *(histórico, ver abaixo)*, [roles/](roles/README.md) *(histórico, ver abaixo)*, [permissions/](permissions/README.md) *(encerrado, ver abaixo)* |
| C — Governança | [audit/](audit/README.md), [configuration/](configuration/README.md), [feature-flags/](feature-flags/README.md) *(antes "Discovery Required", resolvido por `ADR-0038`/`ENG-0140`)* |
| D — Dados | [storage/](storage/README.md), [files/](files/README.md) |
| E — Comunicação | [notifications/](notifications/README.md), [realtime/](realtime/README.md) |
| F — Inteligência/Automação | [ai-runtime/](ai-runtime/README.md), [automation-runtime/](automation-runtime/README.md), [scheduler/](scheduler/README.md) |
| G — Observabilidade/Integração | [search/](search/README.md), [monitoring/](monitoring/README.md), [integration-hub/](integration-hub/README.md) |

Nenhuma fase começa antes da anterior estar completa. Detalhes de dependência módulo-a-módulo em cada `README.md`.

## Classificação Arquitetural (Missão ENG-0007, `KERNEL_BOUNDARY_REVIEW.md`)

A "Fase" acima reflete apenas a ordem de implementação original de `ARCH-001` — **não** distingue Domain Layer de Infrastructure Layer. Essa distinção foi investigada formalmente (`ENG-0007`) e é registrada aqui:

- **Domain Capabilities** (linguagem ubíqua própria, Aggregate confirmado, ciclo de EPIC completo): [identity/](identity/README.md), [organizations/](organizations/README.md), [audit/](audit/README.md).
- **Infrastructure Capabilities com código real, totalmente funcional** (`ENG-0139`/`ADR-0037`, `ENG-0140`/`ADR-0038`/`ADR-0039`, `ENG-0142`/`ADR-0041`): [event-bus/](event-bus/README.md) (`EventBus`, in-process), [logging/](logging/README.md) (`Logger`, `ConsoleLogger`), [scheduler/](scheduler/README.md) (`Scheduler`, `InProcessScheduler`), [monitoring/](monitoring/README.md) (`HealthCheck`, `DatabaseHealthCheck`), [notifications/](notifications/README.md) (`Notifier`, `ConsoleNotifier`), [search/](search/README.md) (`SearchIndex`, `PostgresPartySearch` — só `Party`), [files/](files/README.md) (`FileStorage`, `LocalFileStorage` — sem controle de cota), [realtime/](realtime/README.md) (`RealtimeBroadcaster`, adapter em `apps/api`), [configuration/](configuration/README.md)/[feature-flags/](feature-flags/README.md) (Aggregates mínimos, `ADR-0038`), [automation-runtime/](automation-runtime/README.md) (`AutomationRule`, inspirado no Salesforce Flow — gatilho real sobre o Event Bus, ações `log`/`notify`/`webhook`, verificado ao vivo com um listener HTTP real recebendo o payload). `event-bus/` já havia sido encerrado como domínio antes disso (`EVENT_BUS_DISCOVERY.md`, `EVENT_BUS_EPIC_CLOSURE.md`, EPIC-006).
- **Infrastructure Capabilities estruturais, código real, sem chamada externa de verdade** (nenhuma credencial existe para nenhum fornecedor): [integration-hub/](integration-hub/README.md) (`ENG-0141`/`ADR-0040` — 7 Ports para WhatsApp/Meta/Bling/Google, sistemas nomeados pelo CTO), [ai-runtime/](ai-runtime/README.md) (`ENG-0142`/`ADR-0041`, inspirado no Salesforce Einstein Copilot — `OPENAI_API_KEY`/`ANTHROPIC_API_KEY` vazias). Ambos com `loggedOnly: true` propagado até a resposta HTTP.
- **Infrastructure Capability sem implementação, por decisão explícita** (`ADR-0039`): [storage/](storage/README.md) — "controle de uso" pressupõe uma regra de cota/plano que não existe (`Subscription`, `ADR-0031`); `files/` (Fase D irmã) funciona sem depender dele.
- **Encerrado / sem capacidade própria**: [permissions/](permissions/README.md) — `Permission` é Value Object dentro de `Identity` (`PERMISSION_EPIC_CLOSURE.md`, EPIC-004).
- **Scaffolding histórico, já absorvido por `identity/`, fechado formalmente em `ENG-0139`** (por analogia direta a `permissions/PERMISSION_EPIC_CLOSURE.md` — resolve a pendência antes registrada em `KERNEL_BOUNDARY_REVIEW.md § 3/6`): [users/](users/README.md), [roles/](roles/README.md).

**Todos os 20 módulos têm hoje uma disposição final e evidenciada** — nenhum permanece em "🚧 Estrutura criada, nenhuma implementação". Detalhes completos, evidência e nível de confiança de cada classificação original: [KERNEL_BOUNDARY_REVIEW.md](KERNEL_BOUNDARY_REVIEW.md) (Missão ENG-0007, parcialmente superado pelas resoluções acima).

## Relação com Outros Módulos

- [knowledge/core/SYSTEM_ARCHITECTURE.md § 4 Kernel](../../knowledge/core/SYSTEM_ARCHITECTURE.md) — lista 21 domínios de Kernel; esta implementação cobre os 20 pedidos pela Ordem de Missão ARCH-001 (diverge em 4 itens — ver nota em [PROJECT_RULES.md](../../PROJECT_RULES.md))
- [knowledge/core/BOM.md](../../knowledge/core/BOM.md) / [knowledge/core/objects/](../../knowledge/core/objects/README.md) — Object Specifications dos objetos que módulos de Kernel expõem (Organization, User, Role, Permission)
- [packages/contracts/](../../packages/contracts/README.md) — camada de contrato (eventos, API, schemas) usada na comunicação entre módulos de Kernel e domínios (Missão ENG-0000.1)
- [adr/ADR-0004](../../adr/ADR-0004-mover-kernel-para-services.md) — decisão de mover o Kernel de `packages/kernel/` para `services/`
- [adr/ADR-0005](../../adr/ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md) — stack de backend (NestJS/Prisma) usada por estes serviços
- [adr/ADR-0006](../../adr/ADR-0006-monorepo-structure-decision.md) — decisão de separar Kernel (`services/kernel/`) de Business Domains (`services/domains/`)
- [KERNEL_BOUNDARY_REVIEW.md](KERNEL_BOUNDARY_REVIEW.md) (Missão ENG-0007) — classificação Domain/Infrastructure de todos os 20 módulos, violações e pendências encontradas

## Status

🟢 Estrutura criada (Missão ARCH-001), migrada para `services/` (ENG-0000), reorganizada em `services/kernel/` (ENG-0000.1). README + CONTRACT por módulo.

**3 Domain Capabilities com código real**: `identity/` (`@novaris/identity`, User/Role Aggregates + 3 Domain Services), `organizations/` (`@novaris/organizations`, Organization Aggregate), `audit/` (`@novaris/audit`, AuditEntry Aggregate).

**11 Infrastructure Capabilities com código real, totalmente funcionais** (`ENG-0139`/`ADR-0037`, `ENG-0140`/`ADR-0038`/`ADR-0039`, `ENG-0142`/`ADR-0041` — fecham as Fases A, C, D, E, F e G do Kernel): `event-bus/`, `logging/`, `scheduler/`, `monitoring/` (`GET /health`), `notifications/`, `search/` (só `Party`), `configuration/`, `feature-flags/` (Aggregates mínimos, `ADR-0038`), `files/` (disco local, sem cota), `realtime/` (broadcast WebSocket verificado ao vivo), `automation-runtime/` (inspirado no Salesforce Flow — regra com ação `webhook` verificada ao vivo, um listener HTTP real recebendo o evento `UserCreated`, e toggle desativando a assinatura em runtime, sem restart).

**2 Infrastructure Capabilities estruturais** (código real, nenhuma chamada externa de verdade — nenhuma credencial existe): `integration-hub/` (`ENG-0141`/`ADR-0040`, 7 Ports para WhatsApp/Meta/Bling/Google) e `ai-runtime/` (`ENG-0142`/`ADR-0041`, inspirado no Salesforce Einstein Copilot). Ambos com `loggedOnly: true` em toda resposta.

**1 módulo sem implementação, por decisão explícita**: `storage/` — depende de uma regra de cota/plano que não existe (`ADR-0031`, `ADR-0039`).

`permissions/` encerrado sem capacidade própria (EPIC-004); `users/`/`roles/` encerrados pelo mesmo critério (`ENG-0139`).

Classificação original e pendências: [KERNEL_BOUNDARY_REVIEW.md](KERNEL_BOUNDARY_REVIEW.md) (Missão ENG-0007, parcialmente superado). **As 7 Fases do Kernel (A-G) estão hoje todas fechadas** — os 20 módulos têm disposição final: 3 Domain Capabilities + 11 Infrastructure Capabilities reais e funcionais + 2 estruturais (aguardando credencial de terceiro) + 1 deliberadamente não implementado (`storage`) + 3 históricos sem capacidade própria (`permissions`/`roles`/`users`) = 20/20.
