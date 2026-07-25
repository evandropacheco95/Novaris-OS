# Architecture Decision Records (ADRs)

Registro histórico e imutável das decisões de arquitetura do NOVARIS. Cada decisão relevante — escolha de tecnologia, mudança de padrão, trade-off aceito — deve ser registrada aqui **antes** de ser implementada.

## Por que ADRs?

- Preservam o *porquê* de uma decisão, não apenas o *o quê*.
- Evitam que decisões já discutidas sejam revisitadas do zero.
- Servem de contexto para novas pessoas no time e para agentes de IA que assistem o desenvolvimento.

## Convenção de Nomenclatura

```
ADR-NNNN-titulo-curto-da-decisao.md
```

Numeração sequencial, sempre crescente, nunca reutilizada — mesmo que um ADR seja posteriormente revogado (`superseded`).

⚠️ **`ADR-ORG-001`** (Missão `ADR-ORG-001`, EPIC-003) introduziu um padrão alternativo — `ADR-<DOMÍNIO>-NNN`, escopado a um domínio específico (Organization) — diferente da sequência única `ADR-NNNN` usada até aqui. Registrado como fato, não reconciliado: se ADRs futuras escopadas a domínio devem seguir esse padrão ou entrar na sequência única `ADR-NNNN` é uma decisão de governança ainda em aberto (ver `ADR-ORG-001-organization-status-strategy.md § Nota sobre Nomenclatura`).

## Template de ADR

O template oficial é [TEMPLATE.md](TEMPLATE.md), com 10 seções fixas: Problema, Contexto, Alternativas, Escolha, Consequências, Responsável, Data, Impactos, Plano de Migração, Status. Todo ADR novo deve seguir essa estrutura.

⚠️ `ADR-0001` e `ADR-0002` foram escritos antes deste template formal e usam uma estrutura mais enxuta (Status/Contexto/Decisão/Consequências, e no caso do `ADR-0002` também Data/Responsável/Alternativas/Plano de Migração/Impactos). Ficam como estão — não reescrevi decisões já registradas para caber num template novo — mas todo ADR a partir daqui segue `TEMPLATE.md`.

## Índice de ADRs

| # | Título | Status |
|---|---|---|
| [ADR-0001](ADR-0001-registrar-decisoes-de-arquitetura.md) | Registrar decisões de arquitetura como ADRs | Aceito |
| [ADR-0002](ADR-0002-reestruturar-arvore-do-repositorio.md) | Reestruturar a árvore de topo do repositório | Aceito |
| [ADR-0003](ADR-0003-construir-kernel-como-pacotes-compartilhados.md) | Construir o Kernel como pacotes compartilhados (`packages/kernel/`) | 🔴 Revogado por ADR-0004 |
| [ADR-0004](ADR-0004-mover-kernel-para-services.md) | Mover o Kernel de `packages/kernel/` para `services/` | Aceito |
| [ADR-0005](ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md) | Adotar NestJS, Prisma, pnpm e Turborepo | Aceito |
| [ADR-0006](ADR-0006-monorepo-structure-decision.md) | Separar Kernel (`services/kernel/`) de Business Domains (`services/domains/`); criar `packages/contracts/` e `packages/ai/` | 🟡 Aceito, amendado por ADR-0007 |
| [ADR-0007](ADR-0007-domain-boundaries.md) | Product Layer vs. Domain Layer; remove `services/domains/growth/`, adiciona `customer/`, `marketing/`, `analytics/` | Aceito |
| [ADR-0008](ADR-0008-foundation-freeze.md) | Foundation Freeze & Governance Integration — consolida Constituição, Roadmaps, Papéis, Planejamento e Playbooks em fonte canônica única | Aceito |
| [ADR-0009](ADR-0009-engineering-entry-point-authority.md) | Autoridade dos documentos de entrada de engenharia — NEF (referência estrutural), Handbook (onboarding linear), NES (histórico) | Aceito |
| [ADR-0010](ADR-0010-authentication-credential-strategy.md) | Estratégia de autenticação por credencial do Identity Domain — senha com hash, verificação via Port de Infrastructure, `User` nunca conhece a senha | Aceito |
| [ADR-ORG-001](ADR-ORG-001-organization-status-strategy.md) | Estratégia de estado do Aggregate `Organization` — campo `status` com 5 valores (`§ STATUS`), `§ LIFECYCLE` tratado como narrativa, `Deleted` representado por `deleted_at` | Aceito |
| [ADR-0012](ADR-0012-queue-ownership.md) | `Queue` pertence ao domínio `Automation` (reatribuído de `CRM`, cuja atribuição foi invalidada por uma decisão de arquitetura irmã — ver nota abaixo); sujeito à confirmação de `Automation` como Business Domain | 🟡 Aceito, resolvido por `ADR-0013` |
| [ADR-0013](ADR-0013-automation-domain-confirmation.md) | `Automation` confirmado Platform Capability (Infrastructure), não Business Domain — `Queue` e os demais 6 objetos de `Automation` reclassificados, sem Owner de Domain Layer | Aceito |
| [ADR-0014](ADR-0014-ai-architectural-position.md) | `AI` confirmada Transversal Intelligence Layer (definição em `packages/ai/` + execução em `ai-runtime` + governança em `CONSTITUTION.md Artigo 13`) — não Business Domain, não Infrastructure Capability simples; encerra `ENG-0011` item 6 integralmente | Aceito |
| [ADR-0015](ADR-0015-knowledge-domain-position.md) | `Knowledge` absorvido pela AI Transversal Intelligence Layer (`ADR-0014`) — não Business Domain; `Article`/`Playbook`/`Manual`/`Specification` reclassificados como conteúdo-fonte de Knowledge Base; encerra `ENG-0011` item 11 | Aceito |
| [ADR-0016](ADR-0016-task-ownership.md) | `Task` confirmado como Entity do `Project Domain` (reafirma `ENG-0011` item 8); `Activity`/`Sales`/IA consomem por referência de id, não por posse; sobreposição de nome com `BACKLOG.md` registrada, não resolvida | Aceito |
| [ADR-0017](ADR-0017-task-vocabulary-separation.md) | `Task` (Project Domain, Operacional) e `Task` (BACKLOG.md, nível de planejamento) confirmados como conceitos distintos — resolvido por convenção de citação qualificada, nenhum conteúdo-fonte alterado | Aceito |
| [ADR-0018](ADR-0018-studio-marketplace-position.md) | `Studio` = Product Layer, composto por `Marketing`(`Landing Page`) + `Analytics`(`Dashboard`) + futuro motor de construção (Platform Capability); `Marketplace` = Product Layer, composto por `integration-hub` + `Organization`/`configuration` — nenhum dos dois é Business Domain | Aceito |
| [ADR-0019](ADR-0019-architecture-freeze.md) | Macro arquitetura NOVARIS declarada `ARCHITECTURE FROZEN WITH DOCUMENTED EXCEPTIONS` — camada macro/estratégica congelada, fase de implementação de domínio autorizada; 23 conceitos de ownership e 7 perguntas de Aggregate Design permanecem exceções documentadas, não bloqueantes | Aceito |
| [ADR-0020](ADR-0020-sales-quotation-position.md) | `Quotation` confirmado conceito distinto de `Proposal` dentro de `Sales` (não sinônimo, não Financial, não obsoleto) — Owner `Sales` reafirmado; conteúdo/atributos permanecem pendentes de Aggregate Design Freeze | Aceito |
| [ADR-0021](ADR-0021-pipeline-nature.md) | `Pipeline` confirmado Aggregate Root próprio de `Sales` (Configuration Aggregate, mesmo padrão de `Role`/Identity) — não Organization Configuration, não Entity de `Opportunity`; `Stage` confirmado Entity interna de `Pipeline` | Aceito |
| [ADR-0022](ADR-0022-constitution-knowledge-cycle-amendment.md) | `CONSTITUTION.md` emendada (v1.0.0 → v1.1.0, Artigo 22): Artigo 2 ganhou identidade oficial do produto ("Intelligent Operating Platform" / "Plataforma Operacional Inteligente"); Artigo 4 combinou recorte geográfico e de porte de empresa; Artigo 20 nomeou "Knowledge Driven Engineering (KDE)" e acrescentou o "Ciclo do Conhecimento" | Aceito |
| [ADR-0023](ADR-0023-company-identity-statement-consolidation.md) | Consolidação de 5 formulações concorrentes de "o que é a NOVARIS" — `CONSTITUTION.md` Artigo 4 designado Visão oficial única; `NOVARIS_OS.md §§ 1, 3, 20` e `SYSTEM_ARCHITECTURE.md § 2` anotados de forma não-destrutiva, texto original preservado | Aceito |
| [ADR-0024](ADR-0024-domain-and-product-count-consolidation.md) | Contagem oficial consolidada: **10 Business Domains** (`DOMAIN_MODEL.md`) e **9 produtos** (`PRODUCTS.md`, escolha explícita do CTO); `SYSTEM_ARCHITECTURE.md § 5` e `NOVARIS_OS.md § 7` anotados de forma não-destrutiva | Aceito |
| [ADR-0025](ADR-0025-party-minimum-fields.md) | `Party` (Customer Domain) ganha 2 campos mínimos de conteúdo, antes ausentes de `BOM.md` — `name` (obrigatório) e `document` (opcional, CPF/CNPJ) — desbloqueando a primeira implementação real do domínio (`ENG-0125`) | Aceito |
| [ADR-0026](ADR-0026-project-task-structure.md) | `Task` (Project Domain) confirmado Internal Entity de `Project`, não Aggregate Root próprio — mesmo critério já usado para `Pipeline`/`Stage` (`ADR-0021`) | Aceito |
| [ADR-0027](ADR-0027-financial-invoice-subscription-aggregates.md) | `Invoice` e `Subscription` (Financial Domain) confirmados como dois Aggregate Roots independentes; `Subscription` reafirmado pertencente a Financial (referência desatualizada em `services/domains/financial/README.md` corrigida) | Aceito |
| [ADR-0028](ADR-0028-workspace-scope-closure.md) | Workspace Domain fechado — `Organization` (já implementado) cobre integralmente a responsabilidade central; `Team`/`Plan`/`Storage`/`Environment` formalmente adiados, sem caso de uso concreto | Aceito |
| [ADR-0029](ADR-0029-system-domain-scope-closure.md) | System Domain fechado — `Audit` confirmado único fragmento real; 7 objetos candidatos formalmente adiados; `Release`/`Queue` reconciliados com suas resoluções já existentes (`Platform/Engineering` e "sem Owner de Domain Layer", respectivamente) | Aceito |
| [ADR-0030](ADR-0030-project-task-minimum-fields.md) | `Project`/`Task` ganham campos mínimos — `Project.name`, `Task.title` (novos) e `Task.status` (4 estados já confirmados em `BOM.md`, apenas traduzidos para união literal) — desbloqueando a implementação real do Project Domain | Aceito |
| [ADR-0031](ADR-0031-financial-minimum-fields.md) | `Invoice`/`Subscription` ganham campos mínimos — `Invoice.amount`/`currency`/`status` (2 estados, `"paid"` evidenciado pelo evento oficial `InvoicePaid`) e `Subscription.name` — desbloqueando a implementação real do Financial Domain; `Payment` não implementado como objeto próprio | Aceito |
| [ADR-0032](ADR-0032-activity-minimum-fields.md) | `Activity` ganha campos mínimos — `partyId`, `status` (`"open"`/`"completed"`, derivado dos eventos `ActivityCreated`/`ActivityCompleted` já confirmados em `BOM.md`), `notes` (opcional) | Aceito |
| [ADR-0033](ADR-0033-marketing-campaign-minimum-fields.md) | `Campaign` ganha campos mínimos — `name` (obrigatório), `startDate`/`endDate` (opcionais); `Asset` não resolvido, posse permanece em aberto | Aceito |
| [ADR-0034](ADR-0034-analytics-dashboard-minimum-fields.md) | `Dashboard` ganha campo mínimo — `name`; `Widget` deliberadamente deixado bloqueado (decisão do CTO) até caso de uso real definir tipos de visualização | Aceito |
| [ADR-0035](ADR-0035-audit-enrichment-mechanism.md) | Audit ganha mecanismo de enriquecimento — chamada direta via Dependency Injection (Handler de origem recebe `CreateAuditEntryHandler` injetado após sucesso da operação primária, falha de auditoria não a reverte); primeira integração real em `UpdateOrganizationProfileHandler` | Aceito |
| [ADR-0036](ADR-0036-rbac-permission-catalog-and-guard.md) | RBAC granular por rota — `PermissionGuard` + `@RequirePermission()` (NestJS Guard/Reflector), reaproveitando `AuthorizationDomainService` já implementado; catálogo de 13 códigos de `Permission` (um por Controller); seed concede o catálogo completo às Roles existentes, preservando paridade | Aceito |
| [ADR-0037](ADR-0037-event-bus-mechanism.md) | Event Bus (Kernel Fase A) implementado real — mecanismo in-process síncrono, sem broker externo, sem dependência de `@novaris/logging`; primeira integração real: `CreateUserHandler` publica `UserCreated`, consumido por um Subscriber de prova via `@novaris/logging`; Audit (`ADR-0035`) não migrado, retrofit dos demais 28 Handlers explicitamente adiado | Aceito |
| [ADR-0038](ADR-0038-configuration-feature-flag-minimum-fields.md) | Resolve o status "Discovery Required" de `configuration`/`feature-flags` (Kernel Fase C) — Aggregates mínimos par chave/valor e chave/booleano por organização, sem catálogo fechado de chaves, sem confirmação explícita do CTO (diferente do precedente de `ADR-0025`/`0030`/etc.) | Aceito |
| [ADR-0039](ADR-0039-remaining-kernel-infrastructure-adapters.md) | Fases D/E/F/G do Kernel — `scheduler`/`monitoring`/`notifications`/`search`/`files`/`realtime` implementados com Port + 1 adapter mínimo real cada (sem fornecedor externo/custo); `storage` deliberadamente não implementado (falta regra de cota); `ai-runtime`/`automation-runtime`/`integration-hub` fora de escopo (exigem especificação de negócio, mesma classe de `PRODUCTS.md`) | Aceito |
| [ADR-0040](ADR-0040-integration-hub-structure-only.md) | `integration-hub` (Fase G) — 7 Ports (WhatsApp, Meta, Bling, Google Calendar/Gmail/Sheets/Ads) com Console adapters (loga, não chama API real) — nenhuma credencial existe para nenhum dos 4 sistemas; `loggedOnly: true` propagado até a resposta HTTP para nunca confundir log com envio real | Aceito |
| [ADR-0041](ADR-0041-automation-ai-runtime-salesforce-reference.md) | `automation-runtime` (Salesforce Flow: gatilho→ação sobre o Event Bus, real e completo, sem condições — `DomainEvent` não tem payload de negócio) e `ai-runtime` (Salesforce Einstein, estrutural — mesma falta de credencial de `integration-hub`) — aplica a diretriz do CTO de usar o Salesforce como referência de estrutura onde nenhuma existe ainda; fecha os 20/20 módulos de Kernel | Aceito |
| [ADR-0042](ADR-0042-lead-aggregate-sales-domain.md) | `Lead` — novo Aggregate Root em `services/domains/sales`, adaptado do Lead-to-Convert do Salesforce; único lugar que respeita `DOMAIN_MODEL.md § DEPENDÊNCIAS` sem exceção; `ConvertLeadHandler` é a primeira composição real entre 2 Business Domains (Sales→Customer), mesmo mecanismo de DI já usado por `ADR-0035` | Aceito |
| [ADR-0043](ADR-0043-case-product-quotation-comment-salesforce-adaptation.md) | `Case` (Activity — Service Cloud), `Product`+`Quotation` (Sales — preenche a lacuna de `Quotation` já reservada desde `ADR-0020`) e `Comment` (Activity — Owner já decidido em `DOMAIN_MODEL.md`, forma definida agora) — 3ª onda de adaptação do Salesforce, mesma autorização de `ADR-0042` | Aceito |
| [ADR-0044](ADR-0044-contract-from-accepted-quotation.md) | `Contract` — novo Aggregate Root em `services/domains/sales`, gerado via Handler dedicado a partir de uma `Quotation` `accepted` (nunca automático); fecha o último objeto oficial do Sales Domain sem posição (exceto `Revenue`, ainda sem forma definida) | Aceito |
| [ADR-0045](ADR-0045-calendarevent-reminder-checklist-minimum-fields.md) | `CalendarEvent`/`Reminder`/`Checklist` — campos mínimos para os 3 objetos do Activity Domain identificados como "bloqueados até extensão de BOM.md" (`ACTIVITY_AGGREGATE_DESIGN.md § 9`); fecha 100% dos objetos oficiais do Activity Domain | Aceito |
| [ADR-0046](ADR-0046-deployment-architecture-vercel-railway-supabase.md) | Arquitetura de deploy — Vercel (`apps/web`, natural fit serverless) + Railway (`apps/api`, processo Node persistente exigido por `EventBus`/`Scheduler`/`WebSocketGateway`) + Supabase Postgres inalterado; documenta 6 bugs reais encontrados e corrigidos no primeiro deploy | Aceito |
| [ADR-0047](ADR-0047-revenue-minimum-fields.md) | `Revenue` — campos mínimos (`amount`/`currency`/`recognizedAt`/`contractId`) e origem (gerado a partir de um `Contract` `active`, sem estados, sem verificação de unicidade); fecha o último objeto oficial do Sales Domain sem posição resolvida (`ADR-0044`) | Aceito |

⚠️ **Nota sobre `ADR-0011`**: o número `ADR-0011` não aparece nesta sequência — foi usado por uma decisão de arquitetura irmã, `ADR-0011-crm-domain-position.md`, criada em `knowledge/architecture/decisions/` (fora deste índice) por instrução literal da Ordem de Missão `ENG-0019`. Isso fragmenta a numeração `ADR-NNNN` em duas localizações — registrado como fato, não reconciliado (mesma classe de problema já anotada acima para `ADR-ORG-001`). Ver `ADR-0011-crm-domain-position.md § Nota de Numeração e Localização` para o registro completo.

## Relação com Outros Módulos

- [NES/README.md](../NES/README.md) — NOVARIS Engineering System; § Capítulo 3 posiciona ADRs logo abaixo do NES na hierarquia proposta, texto histórico preservado verbatim; desde [ADR-0009](ADR-0009-engineering-entry-point-authority.md) o NES não é mais autoridade ativa (ver [PROJECT_RULES.md § Matriz de Autoridade Documental](../PROJECT_RULES.md))

## Status

🚧 Índice a ser expandido conforme novas decisões forem tomadas.
