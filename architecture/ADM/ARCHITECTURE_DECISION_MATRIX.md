# Architecture Decision Matrix (ADM)

Versão: 1.0.0

Status: 🟢 Oficial

Missão: ADM-0001 (Architecture Decision Matrix Integration)

---

## Objetivo

Índice executivo de **todas** as decisões arquiteturais já aprovadas no repositório NOVARIS — um só lugar para responder "qual é a decisão vigente sobre X, onde ela foi tomada, e uma mudança futura precisa de ADR?".

**O ADM não substitui ADRs.** Nenhuma decisão listada aqui perde sua fonte original — cada linha aponta para o documento que a registrou (ADR, Blueprint, Freeze Document etc.). O ADM não cria decisão nova, não altera nenhum ADR existente, não resolve nenhum conflito ainda registrado como aberto em `PROJECT_RULES.md`.

## ⚠️ Nota sobre o Caminho deste Documento

A ordem de missão pediu `docs/architecture/ADM/ARCHITECTURE_DECISION_MATRIX.md`. **`docs/architecture/` não existe** — foi promovido a pasta de topo (`architecture/`) por [ADR-0002](../../adr/ADR-0002-reestruturar-arvore-do-repositorio.md), e recriar `docs/architecture/` duplicaria/conflitaria com essa decisão já aceita (Constituição, Artigo 16 — proíbe duplicação). Por isso este documento vive em **`architecture/ADM/ARCHITECTURE_DECISION_MATRIX.md`** — mesma pasta de arquitetura já canônica, sem criar uma segunda localização. `docs/architecture/README.md` (também pedido) foi correspondentemente entendido como **`architecture/README.md`**. Ambos os desvios de caminho estão registrados em `PROJECT_RULES.md § Nota sobre ADM-0001`.

## Como Ler Este Documento

- **Status**: `Aceito` (vigente) · `Revogado` (substituído, ver ADR sucessor) · `Amendado` (vigente com modificação registrada) · `Congelado` (estrutura fixa, mudança exige ADR) · `Provisório` (em uso, mas pendente de ADR formal).
- **Necessidade de ADR futura**: responde "se esta decisão mudar amanhã, precisa de um ADR?" — `SIM` para tudo que é `Aceito`/`Amendado`/`Congelado` (mudar exige ADR); `SIM` também para itens `Provisório` (a própria decisão inicial ainda não tem ADR); `N/A` para itens já `Revogado` (histórico, não se aplica).

---

## 1. Decisões Formalizadas em ADR

| # | Área | Decisão Atual | Status | Fonte Original | Necessidade de ADR Futura |
|---|---|---|---|---|---|
| ADR-0001 | Governança | Toda decisão de arquitetura relevante é registrada como ADR antes de ser implementada | Aceito | [ADR-0001](../../adr/ADR-0001-registrar-decisoes-de-arquitetura.md) | SIM |
| ADR-0002 | Estrutura do repositório | Árvore de topo reestruturada (`architecture/`, `engineering/`, `adr/`, `specifications/`, `business/`, `playbooks/` promovidas; scaffolding para `apps/`, `packages/`, `services/` etc.) | Aceito | [ADR-0002](../../adr/ADR-0002-reestruturar-arvore-do-repositorio.md) | SIM |
| ADR-0003 | Localização do Kernel | Kernel como pacotes compartilhados em `packages/kernel/` | 🔴 Revogado (por ADR-0004) | [ADR-0003](../../adr/ADR-0003-construir-kernel-como-pacotes-compartilhados.md) | N/A |
| ADR-0004 | Localização do Kernel | Kernel vive em `services/` (não `packages/`) | Aceito | [ADR-0004](../../adr/ADR-0004-mover-kernel-para-services.md) | SIM |
| ADR-0005 | Stack de tooling do monorepo | NestJS, Prisma, pnpm, Turborepo adotados como extensão da stack oficial | Aceito | [ADR-0005](../../adr/ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md) | SIM |
| ADR-0006 | Estrutura de serviços | `services/kernel/` separado de `services/domains/`; criação de `packages/contracts/` e `packages/ai/` | 🟡 Amendado (por ADR-0007) | [ADR-0006](../../adr/ADR-0006-monorepo-structure-decision.md) | SIM |
| ADR-0007 | Limites de domínio | Product Layer (`PRODUCTS.md`) vs. Domain Layer (`DOMAIN_MODEL.md`); `services/domains/growth/` removido, `customer/`/`marketing/`/`analytics/` adicionados | Aceito | [ADR-0007](../../adr/ADR-0007-domain-boundaries.md) | SIM |
| ADR-0008 | Governança documental | Fonte canônica única por assunto: Constituição (`CONSTITUTION.md`), Roadmap (`MASTER_ENGINEERING_ROADMAP.md`), Papéis (`NEF/ROLES.md`), Planejamento (`NEF/PLANNING_MODEL.md`), Playbooks (`engineering/playbooks/`). Foundation Freeze declarado. | Aceito | [ADR-0008](../../adr/ADR-0008-foundation-freeze.md) | SIM |
| ADR-0009 | Ponto de entrada de engenharia | NEF = referência estrutural canônica; Handbook = onboarding em leitura linear canônico; NES = histórico, redirecionado a ambos; `PROJECT_RULES.md` inalterado como autoridade normativa | Aceito | [ADR-0009](../../adr/ADR-0009-engineering-entry-point-authority.md) | SIM |

## 2. Decisões Arquiteturais do Shared Kernel (sem ADR — padrão tático de DDD, não escolha de stack/tecnologia)

| Área | Decisão Atual | Status | Fonte Original | Necessidade de ADR Futura |
|---|---|---|---|---|
| Domain Layer — identidade | `UniqueEntityId`, `Entity<T>`, `AggregateRoot<T>`, `ValueObject<T>` como blocos base de todo objeto de domínio | Aceito | Missão ENG-0001.2 | SIM |
| Primitivas funcionais | `Result<T,E>`, `Either<L,R>`, `Option<T>` — nunca lançar exceção como fluxo normal | Aceito | Missão ENG-0001.3 | SIM |
| Sistema de erros | Hierarquia `AppError` → `DomainError`/`InfrastructureError`/`UnexpectedError`, 10 classes | Aceito | Missão ENG-0001.4 | SIM |
| Contrato de evento | `DomainEvent` como `interface` (não classe) — `eventId`, `aggregateId`, `occurredAt`, `eventName` | Aceito | Missão ENG-0001.5 | SIM |
| Specification Pattern | `Specification<T>`/`AbstractSpecification<T>`/`And`/`Or`/`Not`; composições implementam a interface diretamente (não estendem `AbstractSpecification`) para evitar import circular | Aceito | Missão ENG-0001.6 | SIM |
| Contratos de repositório | `Repository<T>`/`ReadRepository<T>`/`WriteRepository<T>`, retorno via `Result`/`Option` | Aceito | Missão ENG-0001.7 | SIM |
| Contratos de Domain Service | `DomainService`/`AsyncDomainService<TInput,TOutput>`, `DomainServiceResult<T>` | Aceito | Missão ENG-0001.8 | SIM |
| Contratos estruturais | `HasIdentity`, `Timestamped`, `Versionable`, `HasMetadata<T>`, `Auditable` | Aceito | Missão ENG-0001.9 | SIM |
| Framework de teste | `node:test`/`node:assert` (built-in do Node) usado em todo o monorepo | 🟠 Provisório | Missão ENG-0001.2, reafirmado em toda missão de código desde então | SIM (nenhum ADR formal ainda — `ENGINEERING_PLAYBOOK.md § 15`) |
| Estrutura de pacote pnpm | `services/*/*` adicionado a `pnpm-workspace.yaml` para descobrir módulos individuais de Kernel/Domain | Aceito | Missão ENG-0002.3 | SIM (mudança de tooling, não de arquitetura de negócio) |

## 3. Decisões do Identity Domain

| Área | Decisão Atual | Status | Fonte Original | Necessidade de ADR Futura |
|---|---|---|---|---|
| Aggregate Root — User | `User extends AggregateRoot<UserProps>`, `implements Auditable, Versionable, HasMetadata<UserMetadata>` — **implementado em código** ([src/domain/aggregates/user/user.ts](../../services/kernel/identity/src/domain/aggregates/user/user.ts)) | 🔵 Congelado (código real) | [IDENTITY_TECHNICAL_BLUEPRINT.md § 1](../../services/kernel/identity/IDENTITY_TECHNICAL_BLUEPRINT.md), congelado em [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 1](../../services/kernel/identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md) (ENG-0002.5), implementado em ENG-0002.7 | SIM |
| Aggregate Root — Role | `Role extends AggregateRoot<RoleProps>`, `implements Auditable, Versionable` — **implementado em código** ([src/domain/aggregates/role/role.ts](../../services/kernel/identity/src/domain/aggregates/role/role.ts)) | 🔵 Congelado (código real) | Idem acima, implementado em ENG-0002.8 | SIM |
| Value Object — Permission | `Permission` reclassificado de candidato a Aggregate Root para Value Object (imutável, sem ciclo de vida próprio, embutido em `Role`) | 🔵 Congelado | Reclassificado em [IDENTITY_TECHNICAL_BLUEPRINT.md § 3](../../services/kernel/identity/IDENTITY_TECHNICAL_BLUEPRINT.md) (ENG-0002.2); implementado em código na ENG-0002.3; congelado na ENG-0002.5 | SIM |
| Multi-tenancy boundary | Todo `User`/`Role` pertence a exatamente uma Organization (`organizationId`); `User.roleIds` só referencia `Role`s da mesma Organization | 🔵 Congelado | [objects/Organization.md](../../knowledge/core/objects/Organization.md) ("toda informação pertence obrigatoriamente a uma Organization"); regra de `roleIds` explicitada em [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 9](../../services/kernel/identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md) (ENG-0002.5) | SIM |
| Freeze governance rule (Identity) | A partir da ENG-0002.5, mudança estrutural nos Aggregates `User`/`Role` (Ownership, limites transacionais, relações permitidas/proibidas) exige ADR; parâmetros de negócio ainda `requer decisão` não exigem | 🔵 Congelado | [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § Declaração de Freeze](../../services/kernel/identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md) (ENG-0002.5) | N/A (é a própria regra de governança) |
| Repository Contracts — User/Role | `UserRepository extends ReadRepository<User>, WriteRepository<User>`; `RoleRepository extends ReadRepository<Role>, WriteRepository<Role>` — **implementados em código** ([src/domain/repositories/](../../services/kernel/identity/src/domain/repositories/README.md)); zero métodos próprios, composição exata já congelada em `IDENTITY_TECHNICAL_BLUEPRINT.md § 5`; sem `PermissionRepository` (`Permission` é Value Object) | 🔵 Congelado (código real) | [IDENTITY_TECHNICAL_BLUEPRINT.md § 5](../../services/kernel/identity/IDENTITY_TECHNICAL_BLUEPRINT.md), implementado em ENG-0002.9 | SIM |
| Domain Services — identificação e freeze | 3 aprovados (`AuthenticationDomainService`, `AuthorizationDomainService` — já propostos no Blueprint; `RoleAssignmentDomainService` — novo, verifica multi-tenancy antes de `User.assignRole`), 1 candidato condicional (unicidade de `Role.name`, regra ainda não confirmada), 10 rejeitados e documentados; seguem o [DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md](../../knowledge/engineering/standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md) (ENS-0003) ([DOMAIN_SERVICE_IDENTIFICATION.md](../../services/kernel/identity/DOMAIN_SERVICE_IDENTIFICATION.md)) | 🔵 Congelado (identificação) | [IDENTITY_TECHNICAL_BLUEPRINT.md § 4](../../services/kernel/identity/IDENTITY_TECHNICAL_BLUEPRINT.md), [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 9](../../services/kernel/identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md), congelado em ENG-0002.10A | SIM |
| `AuthenticationDomainService` — implementação | `implements AsyncDomainService<VerifyCredentialsInput, User>` — **implementado em código** ([src/domain/services/authentication/](../../services/kernel/identity/src/domain/services/authentication/README.md)); localiza `User` por email (`UserRepository`), confirma `status === "active"`, delega verificação de senha a `PasswordVerifier` (Port, [ADR-0010](../../adr/ADR-0010-authentication-credential-strategy.md)) — nenhum algoritmo/biblioteca de hash decidido | 🔵 Congelado (código real) | [IDENTITY_TECHNICAL_BLUEPRINT.md § 4](../../services/kernel/identity/IDENTITY_TECHNICAL_BLUEPRINT.md), [ADR-0010](../../adr/ADR-0010-authentication-credential-strategy.md), implementado em ENG-0002.10B | SIM |
| `AuthorizationDomainService` — implementação | `implements AsyncDomainService<CheckPermissionInput, boolean>` — **implementado em código** ([src/domain/services/authorization/](../../services/kernel/identity/src/domain/services/authorization/README.md)); carrega `User` + cada `Role` referenciado (`findById` em loop, resolve escolha de índice deixada em aberto no Blueprint § 10), devolve `true`/`false` — somente leitura | 🔵 Congelado (código real) | [IDENTITY_TECHNICAL_BLUEPRINT.md § 4](../../services/kernel/identity/IDENTITY_TECHNICAL_BLUEPRINT.md), implementado em ENG-0002.10C | SIM |
| `RoleAssignmentDomainService` — implementação | `implements AsyncDomainService<AssignRoleInput, void>` — **implementado em código** ([src/domain/services/role-assignment/](../../services/kernel/identity/src/domain/services/role-assignment/README.md)); valida compatibilidade de Organization antes de delegar a `User.assignRole()`, persiste via `UserRepository.save()`. **Os 3 Domain Services do Identity Domain estão implementados.** | 🔵 Congelado (código real) | [DOMAIN_SERVICE_IDENTIFICATION.md § 5](../../services/kernel/identity/DOMAIN_SERVICE_IDENTIFICATION.md), [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 9](../../services/kernel/identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md), implementado em ENG-0002.10D | SIM |

## 3.1 Engineering Standards (ENS)

| Área | Decisão Atual | Status | Fonte Original | Necessidade de ADR Futura |
|---|---|---|---|---|
| Implementação de Aggregate | Padrão obrigatório para todo Aggregate de qualquer domínio: construtor privado, Factory Methods `create`/`reconstitute` retornando `Result`, invariantes verificadas em criação e mutação, Domain Events nomeados `<Aggregate><AçãoNoPassado>`, `organizationId` obrigatório, `src/domain/aggregates/<nome>/` | 🔵 Congelado | [AGGREGATE_IMPLEMENTATION_STANDARD.md](../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001) | SIM |
| Architecture Review Gate | Gate binário PASS/FAIL de 12 critérios, obrigatório ao final de toda missão de implementação (`ENG-`), depois de Self Review/DMV/ACR e antes do Relatório Final e da aprovação do CTO — não substitui os outros três relatórios | 🔵 Congelado | [ARCHITECTURE_REVIEW_GATE_STANDARD.md](../../knowledge/engineering/standards/ARCHITECTURE_REVIEW_GATE_STANDARD.md) (ENS-0002) | SIM |
| Implementação de Domain Service | Padrão obrigatório para todo Domain Service de qualquer domínio, inteiramente genérico (não depende de nenhum conceito do Identity Domain): `DomainService`/`AsyncDomainService` do Shared Kernel, sem Factory Method (via de regra), dependências injetadas via construtor, `Result` obrigatório, Domain Events só via Aggregate invocado (nunca emitidos diretamente), transação nunca cruza Aggregates, `src/domain/services/<nome>/` | 🔵 Congelado | [DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md](../../knowledge/engineering/standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md) (ENS-0003) | SIM |

## 3.5 Decisões do Organization Domain

| Área | Decisão Atual | Status | Fonte Original | Necessidade de ADR Futura |
|---|---|---|---|---|
| Aggregate Root — Organization | `Organization extends AggregateRoot<OrganizationProps>`, `implements Timestamped, HasMetadata<OrganizationMetadata>` (sem `Auditable`/`Versionable` — nenhuma fonte cita `createdBy`/`updatedBy`/`version`) — **implementado em código** ([src/domain/aggregates/organization/organization.ts](../../services/kernel/organizations/src/domain/aggregates/organization/organization.ts)) | 🔵 Congelado (código real) | [ORGANIZATION_TECHNICAL_BLUEPRINT.md § 3](../../services/kernel/organizations/ORGANIZATION_TECHNICAL_BLUEPRINT.md), congelado em [ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md](../../services/kernel/organizations/ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md) (ENG-0003.5), implementado em ENG-0003.7 | SIM |
| Estratégia de `status` | `OrganizationStatus` = 5 valores (`active`/`suspended`/`trial`/`blocked`/`archived`); `§ LIFECYCLE` de `objects/Organization.md` é narrativa, não enum; `Deleted` representado por `deletedAt` | 🔵 Congelado | [ADR-ORG-001](../../adr/ADR-ORG-001-organization-status-strategy.md) | SIM |
| Fronteiras de `Workspace`/`Team`/`Subscription` | `Workspace`/`Team` = candidatos a Aggregate Root próprio (provisório); `Subscription` pertence ao Organization/Workspace Domain, não ao Financial Domain | 🔵 Congelado (provisório) | [ORGANIZATION_DOMAIN_DECISIONS.md](../../services/kernel/organizations/ORGANIZATION_DOMAIN_DECISIONS.md) (`DEC-ORG-002`/`003`/`004`, ENG-0003.4) | SIM, se alterado após confirmação futura |
| Multi-tenancy boundary (Organization) | Enforcement é Infrastructure/Application (Repository scoping + RLS), já vigente platform-wide desde `ENS-0001 § 7` — não responsabilidade do Aggregate `Organization` | 🔵 Congelado | [ORGANIZATION_DOMAIN_DECISIONS.md](../../services/kernel/organizations/ORGANIZATION_DOMAIN_DECISIONS.md) (`DEC-ORG-005`), confirmando [AGGREGATE_IMPLEMENTATION_STANDARD.md § 7](../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) | N/A (regra já vigente, só confirmada) |
| `create()`/`updateProfile()` — implementação | `Organization.create()` exige `status` como input obrigatório (nunca um default do Aggregate — valor inicial não decidido); `updateProfile()` atualiza `name`/`legalName`/`document`/`address`, nunca dispara evento (só `OrganizationCreated` é aprovado); `changePlan()`/`suspend()`/`activate()`/`archive()` **bloqueados**, não implementados | 🔵 Congelado (código real, parcial) | [ORGANIZATION_TECHNICAL_BLUEPRINT.md §§ 7-8](../../services/kernel/organizations/ORGANIZATION_TECHNICAL_BLUEPRINT.md), implementado em ENG-0003.7 | SIM |

## 4. Decisões de Governança de Processo

| Área | Decisão Atual | Status | Fonte Original | Necessidade de ADR Futura |
|---|---|---|---|---|
| Foundation Freeze | Toda mudança estrutural na árvore de governança do repositório exige ADR | Aceito | [ADR-0008](../../adr/ADR-0008-foundation-freeze.md), [FOUNDATION_STATUS.md](../../FOUNDATION_STATUS.md) | N/A (é a própria regra) |
| Relatórios obrigatórios de missão | Toda missão exige Self Review + Architecture Compliance Report (ACR); Domain Model Validation (DMV) obrigatório quando a missão envolve modelagem de domínio; Architecture Review Gate (ARG) obrigatório para toda missão de implementação (`ENG-`) — gate binário PASS/FAIL de 12 critérios, último passo antes do Relatório Final e da aprovação do CTO | Aceito | Missão ENG-0002.A; DMV introduzido na ENG-0002.4; ARG formalizado em [ARCHITECTURE_REVIEW_GATE_STANDARD.md](../../knowledge/engineering/standards/ARCHITECTURE_REVIEW_GATE_STANDARD.md) (ENS-0002), usado ad-hoc primeiro em ENG-0002.7/ENG-0002.8 | N/A (regra de processo, não de arquitetura de código) |
| Protocolo de execução | 11 fases obrigatórias antes de qualquer implementação | Aceito | [.command-center/EXECUTION_PROTOCOL.md](../../.command-center/EXECUTION_PROTOCOL.md) | N/A (regra de processo) |

## 5. Conflitos e Sobreposições Já Registrados (não resolvidos aqui)

O ADM **não** resolve nenhum conflito de governança ainda aberto — cada um continua registrado em detalhe em [PROJECT_RULES.md](../../PROJECT_RULES.md), não duplicado aqui. Resumo de ponteiro:

- `NES/README.md` — hierarquia interna, fluxo de engenharia e estrutura de missão divergentes de documentos já vigentes, permanecem como contradições internas do texto verbatim (sua *autoridade* geral foi resolvida por ADR-0009, mas o conteúdo interno específico do documento não foi reescrito nem precisa ser — é histórico).
- `specifications/` vs. `specs/` — sobreposição de propósito, não resolvida.
- `SYSTEM_ARCHITECTURE.md` — terceira lista de domínios/produtos, terceira árvore de monorepo, divergente da estrutura real.
- Parâmetros de negócio do Identity Domain ainda `requer decisão` (§ 3 acima — unicidade de `Email`, reativação de `User`, remoção de `Role`); unicidade de `Role.name` é "Proposta", não confirmada — candidato a Domain Service condicional registrado em [DOMAIN_SERVICE_IDENTIFICATION.md § 5](../../services/kernel/identity/DOMAIN_SERVICE_IDENTIFICATION.md) (ENG-0002.10A), não decidido.

---

## Relação com Outros Módulos

- [adr/README.md](../../adr/README.md) — índice completo dos 9 ADRs, com o template e a convenção de numeração
- [PROJECT_RULES.md](../../PROJECT_RULES.md) — registro detalhado de cada nota/conflito, histórico de emendas
- [architecture/README.md](../README.md) — índice geral da pasta `architecture/`
- [services/kernel/identity/](../../services/kernel/identity/README.md) — fonte das decisões do Identity Domain (§ 3)
- [FOUNDATION_STATUS.md](../../FOUNDATION_STATUS.md) — status da Foundation Freeze

## Status

🟢 Oficial (v1.0.0). Índice executivo — nenhuma decisão nova criada, nenhum ADR alterado, nenhum conflito resolvido. Atualizar este documento a cada novo ADR ou Freeze Document aprovado.
