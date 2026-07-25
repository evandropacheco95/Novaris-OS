# Identity Domain Closure

Versão: 1.0.0

Status: 🟢 Oficial — encerramento formal, Frozen Architecture

Missão: ENG-0002.11 (Identity Domain Closure & Documentation Freeze) — EPIC-002, Sprint-002

---

## 1. Objetivo do Documento

Este documento representa o **encerramento formal do EPIC-002 (Identity Domain)**. Consolida — sem alterar, sem corrigir, sem reinterpretar — tudo o que já foi decidido, implementado e congelado ao longo de 18 missões (`ENG-0002.1` a `ENG-0002.11`, mais `ENS-0001`/`ENS-0002`/`ENS-0003` e `ADR-0010`, que tocaram diretamente este domínio). É uma missão exclusivamente documental — nenhum arquivo `.ts` foi criado ou alterado.

A partir da aprovação deste documento pelo CTO, o Identity Domain entra em **Frozen Architecture** (§ 11) — a mesma disciplina já aplicada à Foundation ([ADR-0008](../../../adr/ADR-0008-foundation-freeze.md)) e ao desenho estrutural dos Aggregates ([IDENTITY_AGGREGATE_DESIGN_FREEZE.md](IDENTITY_AGGREGATE_DESIGN_FREEZE.md)), agora estendida ao domínio como um todo.

---

## 2. Histórico de Implementação

| Missão | Resultado | Status |
|---|---|---|
| ENG-0002.1 | [IDENTITY_DOMAIN_MODEL.md](IDENTITY_DOMAIN_MODEL.md) — Ubiquitous Language, Bounded Context, Aggregates/Value Objects/Eventos/Casos de Uso propostos | Concluída |
| ENG-0002.2 | [IDENTITY_TECHNICAL_BLUEPRINT.md](IDENTITY_TECHNICAL_BLUEPRINT.md) — modelo técnico completo, `Permission` reclassificado para Value Object | Concluída |
| ENG-0002.A | Governança arquitetural — Self Review + ACR obrigatórios para toda missão futura | Concluída |
| ENG-0002.3 | `Permission`, `Email` implementados (`src/domain/value-objects/`) | Concluída |
| ENG-0002.4 | Domain Policies avaliadas — nenhuma modelada, nenhuma criada | Concluída |
| ENG-0002.5 | [IDENTITY_AGGREGATE_DESIGN_FREEZE.md](IDENTITY_AGGREGATE_DESIGN_FREEZE.md) — desenho estrutural de `User`/`Role` congelado | Concluída |
| ENS-0001 | [AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) — padrão obrigatório de Aggregate, validado contra `User`/`Role` | Concluída |
| ENG-0002.7 | `User` implementado (`src/domain/aggregates/user/`) — primeiro Aggregate Root real | Concluída |
| ENG-0002.8 | `Role` implementado (`src/domain/aggregates/role/`), estruturalmente equivalente a `User` | Concluída |
| ENS-0002 | [ARCHITECTURE_REVIEW_GATE_STANDARD.md](../../../knowledge/engineering/standards/ARCHITECTURE_REVIEW_GATE_STANDARD.md) — gate PASS/FAIL formalizado, obrigatório desde então para toda missão `ENG-` | Concluída |
| ENG-0002.9 | `UserRepository`/`RoleRepository` implementados (`src/domain/repositories/`) — zero métodos por conveniência | Concluída |
| ENG-0002.10A | [DOMAIN_SERVICE_IDENTIFICATION.md](DOMAIN_SERVICE_IDENTIFICATION.md) — 3 Domain Services aprovados, 1 candidato condicional, 10 rejeitados | Concluída |
| ENS-0003 | [DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md](../../../knowledge/engineering/standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md) — padrão obrigatório, genérico, de Domain Service | Concluída |
| ENG-0002.10B (1ª tentativa) | Interrompida por decisão do CTO — mecanismo de credencial indefinido | Bloqueada, resolvida por ADR-0010 |
| ADR-0010 | [ADR-0010-authentication-credential-strategy.md](../../../adr/ADR-0010-authentication-credential-strategy.md) — senha com hash como modelo primário; `User` nunca conhece a senha | Concluída |
| ENG-0002.10B (reexecução) | `AuthenticationDomainService` implementado (`src/domain/services/authentication/`) | Concluída |
| ENG-0002.10C | `AuthorizationDomainService` implementado (`src/domain/services/authorization/`) | Concluída |
| ENG-0002.10D | `RoleAssignmentDomainService` implementado (`src/domain/services/role-assignment/`) — 3/3 Domain Services completos | Concluída |
| ENG-0002.11 | Este documento — encerramento formal do EPIC-002 | Em conclusão |

---

## 3. Estado Final do Modelo de Domínio

### Aggregates

#### User

- **Responsabilidade**: identidade própria (`id`, `email: Email`), pertencimento a exatamente uma Organization (`organizationId`), ciclo de vida (`status`: `created → invited → active → disabled`, sem reativação), referências a `Role`s por identidade (`roleIds: UniqueEntityId[]`), auditoria (`createdAt`/`updatedAt`/`createdBy`/`updatedBy`), versionamento (`version`), metadata estrutural.
- **Não responsabilidade**: não conhece senha ou qualquer credencial ([ADR-0010](../../../adr/ADR-0010-authentication-credential-strategy.md)); não decide se possui uma `Permission` (isso é do `AuthorizationDomainService`); não valida compatibilidade de Organization ao ganhar um `Role` (isso é do `RoleAssignmentDomainService`); não se persiste (isso é do `UserRepository`, chamado por quem orquestra).
- **Documento fonte**: [IDENTITY_TECHNICAL_BLUEPRINT.md § 1](IDENTITY_TECHNICAL_BLUEPRINT.md), congelado em [IDENTITY_AGGREGATE_DESIGN_FREEZE.md](IDENTITY_AGGREGATE_DESIGN_FREEZE.md), implementado em `src/domain/aggregates/user/user.ts` (ENG-0002.7).

#### Role

- **Responsabilidade**: identidade própria, pertencimento a exatamente uma Organization, nome (`name`), `Permission`s embutidas por valor (`permissions: Permission[]`), auditoria, versionamento.
- **Não responsabilidade**: não mantém nenhuma referência de volta a `User` (Freeze § 9 — isolamento de Aggregate); não valida unicidade de `name` dentro da Organization (regra "Proposta", candidato condicional a Domain Service, não confirmada nem implementada); não implementa `HasMetadata` (nenhuma fonte associa metadados a `Role`).
- **Documento fonte**: [IDENTITY_TECHNICAL_BLUEPRINT.md § 1](IDENTITY_TECHNICAL_BLUEPRINT.md), congelado em [IDENTITY_AGGREGATE_DESIGN_FREEZE.md](IDENTITY_AGGREGATE_DESIGN_FREEZE.md), implementado em `src/domain/aggregates/role/role.ts` (ENG-0002.8).

### Value Objects

#### Email

- **Responsabilidade**: validar formato (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), normalizar (trim + lowercase), imutável, igualdade por valor.
- **Não responsabilidade**: não sabe se é único (unicidade por Organization ou global — `requer decisão`, § 7); não sabe a quem pertence.
- **Documento fonte**: [IDENTITY_TECHNICAL_BLUEPRINT.md § 3](IDENTITY_TECHNICAL_BLUEPRINT.md), implementado em `src/domain/value-objects/email.ts` (ENG-0002.3).

#### Permission

- **Responsabilidade**: validar formato `<domínio>.<recurso>.<ação>` ([BOM.md](../../../knowledge/core/BOM.md)), imutável, igualdade por valor.
- **Não responsabilidade**: não sabe a qual `Role` foi concedida; sem Repository próprio (persistida como parte de `Role`).
- **Documento fonte**: [IDENTITY_TECHNICAL_BLUEPRINT.md § 3](IDENTITY_TECHNICAL_BLUEPRINT.md), implementado em `src/domain/value-objects/permission.ts` (ENG-0002.3).

#### UniqueEntityId

- **Responsabilidade**: identidade única, gerada via `node:crypto`, igualdade por valor.
- **Não responsabilidade**: não é específico do Identity Domain — pertence ao Shared Kernel, reutilizado sem alteração.
- **Documento fonte**: `packages/shared-kernel/src/core/entities/unique-entity-id.ts` (ENG-0001.2).

### Domain Services

#### AuthenticationDomainService

- **Responsabilidade**: dado `{ email, password }`, localizar o `User` correspondente, confirmar `status === "active"`, delegar verificação de senha a um Port (`PasswordVerifier`), devolver o `User` autenticado ou falha uniforme.
- **Não responsabilidade**: não decide algoritmo/biblioteca de hash ([ADR-0010](../../../adr/ADR-0010-authentication-credential-strategy.md)); não gera sessão/token (Session explicitamente fora do escopo técnico do domínio); não emite Domain Event (autenticação não muta nenhum Aggregate).
- **Documento fonte**: [IDENTITY_TECHNICAL_BLUEPRINT.md § 4](IDENTITY_TECHNICAL_BLUEPRINT.md), aprovado em [DOMAIN_SERVICE_IDENTIFICATION.md § 5](DOMAIN_SERVICE_IDENTIFICATION.md) (R4+R11), implementado em `src/domain/services/authentication/` (ENG-0002.10B).

#### AuthorizationDomainService

- **Responsabilidade**: dado `{ userId, permissionCode }`, localizar o `User`, carregar seus `Role`s, devolver `true`/`false` conforme algum `Role` possua a `Permission`.
- **Não responsabilidade**: não muta nenhum Aggregate (somente leitura); não decide política de negação por padrão nem herança de permissão (nenhuma fonte as define).
- **Documento fonte**: [IDENTITY_TECHNICAL_BLUEPRINT.md § 4](IDENTITY_TECHNICAL_BLUEPRINT.md), aprovado em [DOMAIN_SERVICE_IDENTIFICATION.md § 5](DOMAIN_SERVICE_IDENTIFICATION.md) (R10), implementado em `src/domain/services/authorization/` (ENG-0002.10C).

#### RoleAssignmentDomainService

- **Responsabilidade**: dado `{ userId, roleId, assignedBy }`, localizar `User` e `Role`, validar que pertencem à mesma Organization, delegar a mutação a `User.assignRole()`, persistir via `UserRepository`.
- **Não responsabilidade**: não muta `Role`; não decide política de remoção/revogação (`User.revokeRole()` não precisa deste serviço); não verifica duplicidade de atribuição (comportamento herdado de `User.assignRole()`, não alterado).
- **Documento fonte**: [DOMAIN_SERVICE_IDENTIFICATION.md § 5](DOMAIN_SERVICE_IDENTIFICATION.md) (R7, novo), [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 9](IDENTITY_AGGREGATE_DESIGN_FREEZE.md), implementado em `src/domain/services/role-assignment/` (ENG-0002.10D).

---

## 4. Arquitetura Final do Identity Domain

### Domain Layer (implementada)

| Bloco | Conteúdo |
|---|---|
| Entity | `User`, `Role` (via `AggregateRoot<T>` do Shared Kernel) |
| Value Objects | `Email`, `Permission` |
| Aggregates | `User`, `Role` — 2, ambos congelados |
| Repository Contracts | `UserRepository`, `RoleRepository` — composições de `ReadRepository<T>`/`WriteRepository<T>`, zero métodos próprios |
| Domain Services | `AuthenticationDomainService`, `AuthorizationDomainService`, `RoleAssignmentDomainService` — 3, todos implementados |
| Domain Events | 9 (`UserCreated`, `UserInvited`, `UserActivated`, `UserDisabled`, `RoleAssignedToUser`, `RoleRevokedFromUser`, `RoleCreated`, `PermissionGrantedToRole`, `PermissionRevokedFromRole`) |

### Application Layer (responsabilidade futura, ainda vazia)

Orquestração de casos de uso (ex.: "convidar usuário", "verificar permissão para uma requisição"), tradução de DTOs de entrada/saída, fornecimento de `createdBy`/`updatedBy` a partir do contexto de sessão, sequenciamento de chamadas aos Repositories sem cruzar Aggregates na mesma transação.

### Infrastructure Layer (responsabilidade futura, ainda vazia)

Implementação concreta de `UserRepository`/`RoleRepository`, implementação concreta do Port `PasswordVerifier` (algoritmo de hash — `requer decisão`, § 7), persistência real, logging, Event Bus.

### Interface Layer (responsabilidade futura, ainda vazia)

Exposição de API (REST ou outro protocolo), tradução de requisições externas para os casos de uso da Application Layer.

Nenhum framework decidido ou mencionado neste documento — a stack já aprovada ([ADR-0005](../../../adr/ADR-0005-adotar-nestjs-prisma-pnpm-turborepo.md)) só entra nas camadas Infrastructure/Interface, nenhuma das quais foi tocada por este ou por nenhum EPIC-002.

---

## 5. Decisões Arquiteturais Congeladas

| Decisão | Documento Fonte |
|---|---|
| `User` não conhece senha | [ADR-0010](../../../adr/ADR-0010-authentication-credential-strategy.md) |
| Credencial não pertence ao Aggregate `User` | [ADR-0010](../../../adr/ADR-0010-authentication-credential-strategy.md), [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 4](IDENTITY_AGGREGATE_DESIGN_FREEZE.md) (Ownership sem campo de credencial) |
| Authentication usa Port de verificação (`PasswordVerifier`) | [ADR-0010](../../../adr/ADR-0010-authentication-credential-strategy.md), `src/domain/services/authentication/password-verifier.ts` (ENG-0002.10B) |
| `Role` pertence a exatamente uma Organization | [IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 4, 6](IDENTITY_AGGREGATE_DESIGN_FREEZE.md) |
| `Permission` pertence a `Role` (embutida por valor, nunca por referência) | [IDENTITY_TECHNICAL_BLUEPRINT.md § 3](IDENTITY_TECHNICAL_BLUEPRINT.md), [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 8](IDENTITY_AGGREGATE_DESIGN_FREEZE.md) |
| `User` referencia `Role` por identidade (`roleIds`), nunca embute o objeto | [IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 4, 8](IDENTITY_AGGREGATE_DESIGN_FREEZE.md) |
| Domain Service só existe quando os critérios de existência são satisfeitos | [DOMAIN_SERVICE_IDENTIFICATION.md § 2](DOMAIN_SERVICE_IDENTIFICATION.md), [DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md § 2](../../../knowledge/engineering/standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md) |

---

## 6. Operações Rejeitadas Permanentemente

| Operação | Motivo Arquitetural |
|---|---|
| `findByEmail` no Repository Contract | Antecipa uma decisão de índice/infraestrutura ainda não tomada ([IDENTITY_TECHNICAL_BLUEPRINT.md § 5](IDENTITY_TECHNICAL_BLUEPRINT.md), ENG-0002.9); `AuthenticationDomainService`/`AuthorizationDomainService` usam `findAll`/`findById` sobre o que já existe no contrato |
| `PermissionRepository` | `Permission` é Value Object, sem ciclo de persistência independente — vive só como parte de `Role` (ENG-0002.9) |
| Hashing/verificação de senha dentro do domínio | Decisão de tecnologia (algoritmo, biblioteca) — proibida desde ENG-0001.8, resolvida como responsabilidade de Infrastructure via Port em [ADR-0010](../../../adr/ADR-0010-authentication-credential-strategy.md) |
| `UserFinderDomainService` / `RoleFinderDomainService` (genéricos) | Wrapper fino sobre Repository, sem lógica de domínio própria — não satisfaz nenhum critério de existência de Domain Service (ENG-0002.10A) |
| Eventos não definidos (`UserAuthenticated`, `PermissionChecked`, duplicatas de `RoleAssignedToUser`) | Nenhuma fonte oficial os define; autenticação e verificação de permissão não mutam nenhum Aggregate — nada a registrar como evento (ENG-0002.10B/10C/10D) |
| CRUD genérico nos Repository Contracts | Proibido explicitamente desde ENG-0002.9 — contratos refletem só necessidades já comprovadas do domínio, nunca um padrão de banco |
| Consultas técnicas (paginação, filtros por LIKE, otimizações) | Antecipariam decisão de infraestrutura ainda não tomada; nenhuma fonte de domínio as exige (ENG-0002.9) |

---

## 7. Pendências Oficiais

Nenhuma implementação foi criada para nenhuma destas — permanecem registradas, não resolvidas:

- **Adapter concreto de `PasswordVerifier`** (algoritmo de hash, biblioteca) — [ADR-0010](../../../adr/ADR-0010-authentication-credential-strategy.md), `requer decisão` de Infrastructure.
- **Estratégia de índice/consulta por `Email`** — [IDENTITY_TECHNICAL_BLUEPRINT.md § 5](IDENTITY_TECHNICAL_BLUEPRINT.md), `requer decisão`.
- **Unicidade de `Role.name` dentro de uma Organization** — candidato condicional a Domain Service, regra em si não confirmada ([DOMAIN_SERVICE_IDENTIFICATION.md § 5](DOMAIN_SERVICE_IDENTIFICATION.md)).
- **Unicidade de `Email`** (por Organization ou global) — [IDENTITY_TECHNICAL_BLUEPRINT.md § 8](IDENTITY_TECHNICAL_BLUEPRINT.md), `requer decisão`.
- **Reativação de `User` desativado** — [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 11](IDENTITY_AGGREGATE_DESIGN_FREEZE.md), `requer decisão`.
- **Remoção de `Role` com `User`s ainda atribuídos** (referência órfã) — [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 10](IDENTITY_AGGREGATE_DESIGN_FREEZE.md), `requer decisão`.
- **Número máximo de `Role`s por `User`** — [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 6](IDENTITY_AGGREGATE_DESIGN_FREEZE.md), `requer decisão`.
- **Futuras decisões de SSO/MFA/Session/Token** — explicitamente fora do escopo técnico desde [IDENTITY_TECHNICAL_BLUEPRINT.md](IDENTITY_TECHNICAL_BLUEPRINT.md) (cabeçalho) e [IDENTITY_DOMAIN_MODEL.md § 9](IDENTITY_DOMAIN_MODEL.md).
- **Infraestrutura de persistência** (implementação concreta de `UserRepository`/`RoleRepository` — Prisma, Supabase ou outra) — Infrastructure Layer inteira ainda vazia.

---

## 8. Boundary do Identity Domain

**O que pertence ao Identity Domain**: `User`, `Role`, `Permission` (Value Object), `Email` (Value Object), autenticação por credencial, verificação de autorização (permissão via Role), atribuição de Role a User.

**O que pertence a outros domínios**: Organization/Workspace (Identity referencia por `organizationId`, nunca controla o ciclo de vida de uma Organization — isso é do Workspace Domain); todos os demais domínios listados em [DOMAIN_MODEL.md](../../../knowledge/core/DOMAIN_MODEL.md), que dependem de Identity mas não são controlados por ele.

**Identity NÃO controla**:

- CRM
- Billing
- Sales
- Marketing
- Comunicação

Identity é o primeiro elo da cadeia de dependências da plataforma ([DOMAIN_MODEL.md § DEPENDÊNCIAS](../../../knowledge/core/DOMAIN_MODEL.md)) — todos os demais domínios dependem dele, ele não depende de nenhum domínio de negócio.

---

## 9. Contrato para Outros Bounded Contexts

Como outros domínios devem consumir Identity, hoje (Application/Infrastructure/Interface Layers ainda vazias — este contrato é sobre o que já existe na Domain Layer):

**Permitido**:

- `UserId` (`UniqueEntityId`)
- `OrganizationId` (`UniqueEntityId`)
- `RoleId` (`UniqueEntityId`)
- `Permission` (valor, formato `<domínio>.<recurso>.<ação>`)

**Proibido**:

- Acessar tabelas internas do Identity Domain (nenhuma existe ainda — quando existirem, permanece proibido).
- Conhecer regras internas de `User`/`Role` (transições de status, formato de `Permission`, checagem de multi-tenancy) — essas regras vivem exclusivamente nos Aggregates e Domain Services do Identity Domain.
- Alterar `User`/`Role` diretamente — toda mutação passa pelos métodos públicos dos próprios Aggregates, nunca por manipulação externa de estado.

Nenhuma API pública foi definida ainda (Interface Layer vazia) — este contrato descreve os identificadores e valores que um domínio consumidor pode legitimamente referenciar, não um mecanismo de acesso concreto.

---

## 10. Checklist de Fechamento

- [x] Aggregates congelados (`User`, `Role` — [IDENTITY_AGGREGATE_DESIGN_FREEZE.md](IDENTITY_AGGREGATE_DESIGN_FREEZE.md))
- [x] Repository Contracts definidos (`UserRepository`, `RoleRepository` — ENG-0002.9)
- [x] Domain Services implementados (`AuthenticationDomainService`, `AuthorizationDomainService`, `RoleAssignmentDomainService` — ENG-0002.10B/C/D)
- [x] Nenhuma regra pendente **dentro** do domínio (as pendências reais em § 7 dependem de decisão externa — Infrastructure, tecnologia, ou confirmação de regra de negócio ainda não tomada — não de trabalho de modelagem do Identity Domain em si)
- [x] Nenhuma dependência externa (Application/Infrastructure/Interface Layers permanecem vazias, Domain Layer não importa delas)
- [x] Nenhum acoplamento com infraestrutura (zero Prisma/Supabase/NestJS/ORM em qualquer arquivo da Domain Layer)
- [x] Documentação completa (Ubiquitous Language, Blueprint, Freeze, Domain Service Identification, Standards, ADR, este documento de fechamento)

---

## 11. Declaração Formal de Freeze

> O Identity Domain entra em estado de Frozen Architecture. Alterações futuras exigem ADR ou nova missão formal.

---

## 12. Referências

**Blueprints**:
- [IDENTITY_DOMAIN_MODEL.md](IDENTITY_DOMAIN_MODEL.md)
- [IDENTITY_TECHNICAL_BLUEPRINT.md](IDENTITY_TECHNICAL_BLUEPRINT.md)

**Freeze Documents**:
- [IDENTITY_AGGREGATE_DESIGN_FREEZE.md](IDENTITY_AGGREGATE_DESIGN_FREEZE.md)
- [DOMAIN_SERVICE_IDENTIFICATION.md](DOMAIN_SERVICE_IDENTIFICATION.md)

**ADR**:
- [ADR-0010-authentication-credential-strategy.md](../../../adr/ADR-0010-authentication-credential-strategy.md)

**ENS**:
- [AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001)
- [ARCHITECTURE_REVIEW_GATE_STANDARD.md](../../../knowledge/engineering/standards/ARCHITECTURE_REVIEW_GATE_STANDARD.md) (ENS-0002)
- [DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md](../../../knowledge/engineering/standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md) (ENS-0003)

**ENG (implementação)**:
- `src/domain/value-objects/` (ENG-0002.3)
- `src/domain/aggregates/user/` (ENG-0002.7)
- `src/domain/aggregates/role/` (ENG-0002.8)
- `src/domain/repositories/` (ENG-0002.9)
- `src/domain/services/authentication/` (ENG-0002.10B)
- `src/domain/services/authorization/` (ENG-0002.10C)
- `src/domain/services/role-assignment/` (ENG-0002.10D)

**Shared Kernel**: [packages/shared-kernel/](../../../packages/shared-kernel/README.md) — todos os componentes reutilizados pelo Identity Domain.

---

## Status

🟢 **Identity Domain Closure concluído. EPIC-002 encerrado documentalmente. Aguardando aprovação formal do CTO antes da abertura de novo Bounded Context.**
