# organizations

## Objetivo

Gestão de organizações (tenants) — o mecanismo central de isolamento multi-tenant.

## Fase

Fase B — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md) e o plano de implementação.

## Interface Pública

🚧 `CONTRACT.md` ainda não escrito — ver [identity/CONTRACT.md](../identity/CONTRACT.md), [event-bus/CONTRACT.md](../event-bus/CONTRACT.md) ou [audit/CONTRACT.md](../audit/CONTRACT.md) como exemplo de padrão a seguir.

## Modelagem de Domínio (EPIC-003)

- [ORGANIZATION_DOMAIN_DISCOVERY.md](ORGANIZATION_DOMAIN_DISCOVERY.md) (ENG-0003.1) — descoberta, separando fato de hipótese.
- [ORGANIZATION_DOMAIN_MODEL.md](ORGANIZATION_DOMAIN_MODEL.md) (ENG-0003.2) — Ubiquitous Language, Bounded Context, Aggregates/Value Objects/Eventos propostos.
- [ORGANIZATION_AGGREGATE_DESIGN.md](ORGANIZATION_AGGREGATE_DESIGN.md) (ENG-0003.3) — design rigoroso do Aggregate `Organization`, não congelado.
- [ORGANIZATION_DOMAIN_DECISIONS.md](ORGANIZATION_DOMAIN_DECISIONS.md) (ENG-0003.4) — `DEC-ORG-001..005`, resolvendo status/lifecycle, fronteiras de `Workspace`/`Team`, dono de `Subscription`, multi-tenancy.
- [ADR-ORG-001](../../../adr/ADR-ORG-001-organization-status-strategy.md) — formaliza a estratégia de `status` (`DEC-ORG-001`).
- [ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md](ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md) (ENG-0003.5) — contrato congelado do Aggregate `Organization`.
- [ORGANIZATION_TECHNICAL_BLUEPRINT.md](ORGANIZATION_TECHNICAL_BLUEPRINT.md) (ENG-0003.6) — assinaturas técnicas completas.

## Código

[src/domain/aggregates/organization/](src/domain/aggregates/organization/README.md) — `Organization` (Missão ENG-0003.7), `extends AggregateRoot<OrganizationProps>`, seguindo [AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001). [src/domain/domain-events/](src/domain/domain-events/README.md) — `OrganizationCreated`, único evento definitivo. `create()`/`reconstitute()`/`updateProfile()` implementados; `changePlan()`/`suspend()`/`activate()`/`archive()` permanecem bloqueados (`ORGANIZATION_TECHNICAL_BLUEPRINT.md § 8`). [src/domain/repositories/](src/domain/repositories/README.md) — `OrganizationRepository` (Missão ENG-0003.9), reutilizando `ReadRepository<T>`/`WriteRepository<T>` do Shared Kernel sem métodos próprios, mesmo padrão de `UserRepository`/`RoleRepository` (Identity, ENG-0002.9). Contrato testado (Missão ENG-0003.10) por [tests/domain/repositories/organization-repository.contract.test.ts](tests/domain/repositories/README.md) — 9 testes de checagem em tempo de compilação, sem Fake/Mock/banco em memória (proibido pela ordem de missão, diferente do precedente de ENG-0002.9). `Slug`/`Document`/`Address`/`BrandingTheme` (Value Objects) avaliados e bloqueados (ENG-0003.8, nenhum tem validação definida em nenhuma fonte). **Infrastructure real** (`ENG-0122`): `PrismaOrganizationRepository`, tabela `organizations` no Postgres real (Supabase). **Application Layer** (`ENG-0128`): `UpdateOrganizationProfileHandler`, exposta via `apps/api/src/organization/` (`GET`/`PATCH /organizations/me`) e `apps/web/app/settings/page.tsx`. Sem `POST /organizations` — criar uma nova Organization (tenant) não é uma operação de usuário logado nesta fase (só o seed de bootstrap, `apps/api/src/seed.ts`, cria Organizations hoje).

**Integração real com o Audit Domain** (`ADR-0035`, `ENG-0135`): `UpdateOrganizationProfileHandler` é a primeira integração real de enriquecimento de auditoria da plataforma — recebe `CreateAuditEntryHandler` (`@novaris/audit`) injetado no construtor e, depois de salvar com sucesso, registra um `AuditEntry` real (`actorId` do usuário autenticado, `changeSet` com antes/depois dos campos de fato alterados). Falha ao registrar auditoria não reverte a atualização de perfil já persistida (`ADR-0035`, seção Decision).

## Dependências

Logging, Event Bus, Identity

## Eventos

[src/domain/domain-events/](src/domain/domain-events/README.md) — `OrganizationCreated` implementado (Missão ENG-0003.7). Demais eventos de `Organization` permanecem candidatos, lista canônica não resolvida.

## Status

🟢 Domain/Infrastructure/Application/API/Frontend completos para `Organization` — perfil visualizável e editável de ponta a ponta (`GET`/`PATCH /organizations/me`, tela `/settings`), testado contra Postgres real (Supabase). `Workspace`/`Team`/`Plan`/`Storage`/`Environment` (demais objetos do Workspace Domain em `DOMAIN_MODEL.md`) permanecem "Ownership Pending CTO Decision" (`DOMAIN_OWNERSHIP.md`) — não implementados, fora do escopo desta fatia.
