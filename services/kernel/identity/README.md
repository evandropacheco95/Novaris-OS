# identity

## Objetivo

Autenticação, sessões e identidade de usuários.

## Fase

Fase B — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md) e o plano de implementação.

## Interface Pública

Ver [CONTRACT.md](CONTRACT.md).

## Modelagem de Domínio

Ubiquitous Language, Bounded Context, Aggregates/Entities/Value Objects propostos, Domain Events, casos de uso e regras de negócio de alto nível: [IDENTITY_DOMAIN_MODEL.md](IDENTITY_DOMAIN_MODEL.md) (Missão ENG-0002.1).

## Blueprint Técnico

Modelo técnico completo (Aggregate Roots, Value Objects, Domain Services, Repository Contracts, Specifications, invariantes, regras transacionais, fluxos, limites de Aggregate, ciclo de vida) reutilizando os componentes do Shared Kernel: [IDENTITY_TECHNICAL_BLUEPRINT.md](IDENTITY_TECHNICAL_BLUEPRINT.md) (Missão ENG-0002.2). `Permission` reclassificado de candidato a Aggregate Root para Value Object.

## Código

[src/domain/value-objects/](src/domain/value-objects/README.md) — `Permission`, `Email` (Missão ENG-0002.3), estendendo `ValueObject<T>` de `@novaris/shared-kernel`. [src/domain/aggregates/](src/domain/aggregates/README.md) — `User` (Missão ENG-0002.7), `Role` (Missão ENG-0002.8), ambos `extends AggregateRoot<T>`, seguindo [AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001). [src/domain/domain-events/](src/domain/domain-events/README.md) — 9 Domain Events (6 de `User`, 3 de `Role`). [src/domain/repositories/](src/domain/repositories/README.md) — `UserRepository`, `RoleRepository` (Missão ENG-0002.9), reutilizando `ReadRepository<T>`/`WriteRepository<T>` do Shared Kernel sem métodos próprios. [src/domain/services/](src/domain/services/README.md) — `AuthenticationDomainService` (Missão ENG-0002.10B), seguindo [DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md](../../../knowledge/engineering/standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md) (ENS-0003); mecanismo de credencial resolvido em [ADR-0010](../../../adr/ADR-0010-authentication-credential-strategy.md). `AuthorizationDomainService` (Missão ENG-0002.10C) — verifica se um `User` possui uma `Permission` via seus `Role`s. `RoleAssignmentDomainService` (Missão ENG-0002.10D) — valida compatibilidade de Organization antes de atribuir um `Role` a um `User`. **Os 3 Domain Services aprovados estão implementados.**

**Application Layer completa (`ENG-0122`/`ENG-0128`)**: `AuthenticateUser` (login) + ciclo de vida completo de `User`/`Role` — `CreateUser`, `ActivateUser`, `DisableUser`, `CreateRole`, `GrantPermission`, `RevokePermission`, `AssignRole` (via `RoleAssignmentDomainService`), `RevokeRole`. **Infrastructure real (`ENG-0122`)**: `PrismaUserRepository`/`PrismaRoleRepository`/`BcryptPasswordVerifier`, tabelas `users`/`roles`/`credentials` no Postgres real (Supabase). **Exposto via API** (`apps/api/src/auth/` para login, `apps/api/src/identity/` para o CRUD) e **Frontend** (`apps/web/app/team/page.tsx`) — Domain Layer é framework-agnóstico (Clean Architecture), NestJS entra só na Composition Root (`apps/api`), nunca neste pacote.

## Domain Policies

Avaliadas (Missão ENG-0002.4) — nenhuma Policy modelada no Blueprint, nenhuma criada preventivamente. Ver [IDENTITY_TECHNICAL_BLUEPRINT.md § 14](IDENTITY_TECHNICAL_BLUEPRINT.md).

## Aggregate Design Freeze

Definição definitiva e congelada dos Aggregates `User`/`Role` — Child Entities, Value Objects, Ownership, limites transacionais, invariantes, navegação, relações permitidas/proibidas, regras de consistência, ciclo de vida, Matriz Aggregate × Components: [IDENTITY_AGGREGATE_DESIGN_FREEZE.md](IDENTITY_AGGREGATE_DESIGN_FREEZE.md) (Missão ENG-0002.5). **A partir desta missão, mudança estrutural nos Aggregates exige ADR.**

## Domain Service Identification

Identificação, classificação e congelamento de todos os Domain Services do domínio, a partir dos critérios oficiais de existência (envolver mais de um Aggregate, depender de Repository, depender de consulta que o Aggregate não pode realizar, ou exigir colaboração entre múltiplos objetos): [DOMAIN_SERVICE_IDENTIFICATION.md](DOMAIN_SERVICE_IDENTIFICATION.md) (Missão ENG-0002.10A). **3 Domain Services aprovados** (`AuthenticationDomainService`, `AuthorizationDomainService`, `RoleAssignmentDomainService`), 1 candidato condicional (unicidade de `Role.name`), 10 candidatos rejeitados e documentados.

## Authentication Credential Strategy

O bloqueio original de `ENG-0002.10B` (mecanismo de verificação de senha indefinido) foi resolvido por [ADR-0010](../../../adr/ADR-0010-authentication-credential-strategy.md): senha tradicional com hash é o modelo oficial primário; `User` nunca conhece a senha (consistente com o Freeze, que já não lista campo de credencial); verificação delegada a um Port de Infrastructure (`PasswordVerifier`), algoritmo/biblioteca `requer decisão` futura.

## Dependências

Logging, Event Bus

## Eventos

9 Domain Events implementados em [src/domain/domain-events/](src/domain/domain-events/README.md) (Missão ENG-0002.7/ENG-0002.8) — 4 já oficiais (`BOM.md`), 5 propostos. Detalhados em [IDENTITY_TECHNICAL_BLUEPRINT.md § 7](IDENTITY_TECHNICAL_BLUEPRINT.md).

## Status

🟢 Domain Layer completo e congelado — `User`/`Role`, 3 Domain Services, 9 Domain Events, Repository Contracts. **Application/Infrastructure/API/Frontend completos** (`ENG-0122`/`ENG-0128`): login real (JWT), CRUD completo de User/Role via `apps/api` (`/auth/login`, `/users`, `/roles`), tela `/team` em `apps/web`. Ciclo de vida completo testado contra Postgres real (criar→ativar→atribuir Role→conceder Permission→revogar→desativar→transição inválida corretamente bloqueada). `AuthorizationDomainService` (verificação de Permission) implementado mas **ainda não consultado por nenhum Guard/rota** — RBAC granular por rota fica para fase futura.
