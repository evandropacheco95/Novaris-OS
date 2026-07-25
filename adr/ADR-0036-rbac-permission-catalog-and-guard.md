# ADR-0036 — RBAC: Catálogo de Permissions + Mecanismo de Guard por Rota

## Problema

`AuthorizationDomainService` (Identity Domain) está implementado, testado (9 testes) e exportado por `@novaris/identity` desde `EPIC-002`, mas **nunca foi consultado por nenhuma rota da API** — confirmado por busca no repositório inteiro. `JwtAuthGuard` verifica apenas "este token é válido", nunca "este usuário tem permissão para isto" (`ENG-0122`, escopo explicitamente registrado como adiado, nunca esquecido — `MISSION_REGISTRY.md`). Hoje, qualquer usuário autenticado pode executar qualquer uma das 48 rotas de 14 Controllers, dentro da própria Organization. Esta ADR decide o mecanismo de aplicação por rota e o catálogo de códigos de `Permission` necessário para ativá-lo.

## Contexto

- `Permission` (`services/kernel/identity/src/domain/value-objects/permission.ts`) é um Value Object — só um código validado pelo formato `<domínio>.<recurso>.<ação>` (regex, 3 segmentos). **Não existe catálogo/enum fixo em nenhum lugar** — qualquer código nesse formato é aceito pela validação.
- O único código de `Permission` que já existiu em dado real é `"sales.opportunities.manage"` (`apps/api/src/seed.ts`), concedido de forma idêntica às duas Roles seed (`SuperMaster`/`Usuario`) — hoje elas são funcionalmente indistinguíveis do ponto de vista de autorização.
- `Role.permissions: Permission[]` já suporta `grantPermission()`/`revokePermission()`, já expostos via API (`POST`/`DELETE /roles/:id/permissions`) — a mecânica de conceder/revogar já existe e funciona; falta só o lado de **checar** no caminho de uma requisição HTTP real.
- `AuthorizationDomainService.execute({ userId, permissionCode })` devolve `Result<boolean>` — nunca lança, nunca falha por "não autorizado" (isso é `Result.ok(false)`, não `Result.fail`); falha só por `permissionCode` malformado ou erro de infraestrutura.
- Nenhum ADR ou documento vinculante já decidiu convenção de nomenclatura de códigos além do formato regex, nem o mecanismo concreto de aplicação (Guard, Decorator, Middleware).

## Decision Drivers

- Reaproveitar `AuthorizationDomainService` sem alterá-lo — a lógica de "tem permissão" já está implementada e testada; esta ADR só decide como uma rota HTTP a consulta.
- O único precedente real (`sales.opportunities.manage`) aplica-se a **todas** as 8 rotas de `OpportunityController` (leitura e escrita) sob um único código — não existe divisão `.read`/`.manage` em nenhuma fonte. Inventar essa divisão agora seria decidir uma granularidade sem evidência de necessidade real.
- Ativar a checagem em todas as rotas simultaneamente, sem atualizar o seed, bloquearia imediatamente ambos os usuários de bootstrap em 47 das 48 rotas (nenhum dos dois tem qualquer permissão além da já existente) — isso quebraria o ambiente de demonstração/testes sem nenhum ganho real de segurança percebido pelo CTO.
- `SuperMaster` e `Usuario` são hoje idênticos em acesso — diferenciar `Usuario` com permissões mais restritas exigiria uma decisão de produto (o que um "Usuario" comum pode e não pode fazer) para a qual não existe nenhuma fonte — inventar essa distinção agora seria fabricar regra de negócio.

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. `NestJS Guard` + `Reflector`/Decorator, um código de Permission por Controller/recurso** | `@RequirePermission(code)` de classe + `PermissionGuard` genérico, reaproveitando `AuthorizationDomainService` | Escolhida — mecanismo idiomático do próprio framework já em uso, zero código novo de domínio |
| B. Middleware Express manual | Checagem fora do sistema de Guards do Nest | Rejeitada — o projeto já usa Guards (`JwtAuthGuard`) para exatamente este tipo de checagem; um Middleware paralelo duplicaria conceito sem motivo |
| C. Checagem manual dentro de cada método de Controller | `if (!(await authService.execute(...))) throw ...` repetido em cada rota | Rejeitada — repetiria a mesma lógica 48 vezes, alto risco de uma rota esquecida; Guard aplica no nível de classe, cobrindo todas as rotas de um Controller de uma vez |
| D. Uma Permission por rota HTTP (não por recurso) | Ex.: `sales.opportunities.create`, `sales.opportunities.advance-stage`, `sales.opportunities.approve-proposal`, ... | Rejeitada — contradiz o único precedente real (`sales.opportunities.manage` já cobre as 8 rotas de Sales sob um único código); inventaria uma granularidade sem evidência, e multiplicaria o catálogo de ~13 para ~48 códigos sem nenhum caso de uso que justifique a granularidade fina |
| E. Diferenciar `Usuario` de `SuperMaster` no catálogo de permissões concedidas | Ex.: `Usuario` só recebe permissões de leitura | Rejeitada nesta ADR — decisão de produto sem fonte; ver "Decisões Adiadas" |

## Decision

**Opção A.**

### Mecanismo

- **`RequirePermission(code: string)`** — decorator novo (`apps/api/src/auth/require-permission.decorator.ts`), via `SetMetadata`, aplicado no nível de **classe** do Controller (todas as rotas de um Controller compartilham o mesmo código — mesma granularidade do precedente `sales.opportunities.manage`).
- **`PermissionGuard`** — Guard novo (`apps/api/src/auth/permission.guard.ts`), lê o metadado via `Reflector`, monta `{ userId: request.user.userId, permissionCode }` e chama `AuthorizationDomainService.execute()` (sem alterá-lo). `Result.isFailure` ou `getValue() !== true` → `ForbiddenException` (`403`, `code: "AUTHORIZATION_ERROR"`). Roda **depois** de `JwtAuthGuard` (`@UseGuards(JwtAuthGuard, PermissionGuard)`) — depende de `request.user.userId` já populado.
- **`AuthModule`** ganha `RoleRepository` (token próprio, mesmo padrão já usado para `UserRepository` — instância independente da de `IdentityModule`, mesmo Prisma singleton por trás) e `AuthorizationDomainService` como providers, e passa a exportar `PermissionGuard` ao lado de `JwtAuthGuard`/`JwtModule` — **nenhum módulo de domínio precisa de um novo import**, todos os 13 já importam `AuthModule`.

### Catálogo de Permissions (13 códigos, um por Controller protegido)

| Código | Controller | Ação (por quê) |
|---|---|---|
| `sales.opportunities.manage` | `OpportunityController` | Já existente — mantido sem alteração |
| `relationship.parties.manage` | `PartyController` | Tem escrita (`POST`) |
| `relationship.relationships.manage` | `RelationshipController` | Tem escrita |
| `identity.users.manage` | `UserController` | Tem escrita |
| `identity.roles.manage` | `RoleController` | Tem escrita |
| `workspace.profile.manage` | `OrganizationController` | Tem escrita (`PATCH`) |
| `project.projects.manage` | `ProjectController` | Tem escrita |
| `financial.invoices.manage` | `InvoiceController` | Tem escrita |
| `financial.subscriptions.manage` | `SubscriptionController` | Tem escrita |
| `activity.activities.manage` | `ActivityController` | Tem escrita |
| `marketing.campaigns.manage` | `CampaignController` | Tem escrita |
| `analytics.dashboards.manage` | `DashboardController` | Tem escrita |
| `system.audit-entries.read` | `AuditEntryController` | **Sem nenhuma rota de escrita** — único código com ação `read`, refletindo honestamente que este Controller não tem superfície de escrita (`ADR-0035`) |

Primeiro segmento = nome oficial do Business Domain (`DOMAIN_MODEL.md`) — `relationship`/`workspace`/`system`, não os nomes de pasta (`customer`/`organizations`/`audit`) — para manter o catálogo consistente com a taxonomia oficial da plataforma, não com detalhes de implementação que já divergem do nome do domínio (`Relationship` → pasta `customer`, por exemplo).

`AuthController` (`POST /auth/login`) permanece sem `JwtAuthGuard`/`PermissionGuard` — autenticação não pode exigir uma Permission antes de existir uma sessão.

### Migração dos dados de seed

`apps/api/src/seed.ts` passa a conceder os 13 códigos a **ambas** as Roles (`SuperMaster` e `Usuario`) — preserva a paridade de acesso que já existe hoje entre elas (nenhuma perde acesso a nada que já tinham); ativa a aplicação real do mecanismo (uma rota sem nenhuma Permission concedida à Role do usuário passa a devolver `403`) sem quebrar o ambiente de demonstração.

## Rejected Alternatives

Ver Opções B, C, D, E acima.

## Consequences

- 13 Controllers ganham `@UseGuards(JwtAuthGuard, PermissionGuard)` + `@RequirePermission("<código>")` de classe.
- `apps/api/src/seed.ts` concede os 13 códigos a ambas as Roles seed.
- Toda Permission futura (para um domínio ainda não protegido, ou uma granularidade mais fina) segue a mesma convenção: um código por recurso/Controller, `manage` se há escrita, `read` se só há leitura.
- `docs/09-seguranca/autenticacao-e-autorizacao.md` (stub, `🚧 A ser detalhado`) ganha nota de que o mecanismo básico agora existe.

## Decisões Adiadas (com justificativa)

| Decisão adiada | Por quê |
|---|---|
| Diferenciar permissões entre `SuperMaster` e `Usuario` | Decisão de produto (o que um "Usuario" comum pode/não pode fazer) sem nenhuma fonte — inventar agora fabricaria regra de negócio |
| Granularidade `.read`/`.manage` separada por recurso | Nenhuma fonte pede isso hoje; o único precedente real usa um único código por recurso cobrindo leitura e escrita — introduzir a divisão exigiria evidência de caso de uso real (ex.: um papel "auditor" só-leitura) |
| Semântica de negação explícita (deny) | `knowledge/core/objects/Permission.md § 10` já registra isso como não definido; permissões seguem só aditivas |
| Permissões por operação individual (uma por rota HTTP) | Rejeitada como Opção D acima — multiplicaria o catálogo sem evidência de necessidade |

## Responsável

CTO / Arquiteto Chefe, decisão direta ("RBAC granular por rota"), escolhida entre 3 opções apresentadas para o próximo passo após o System Domain.

## Data

2026-07-24

## Impactos

- `apps/api/src/auth/require-permission.decorator.ts`, `apps/api/src/auth/permission.guard.ts` — novos.
- `apps/api/src/auth/auth.module.ts` — novos providers (`RoleRepository`, `AuthorizationDomainService`), nova exportação (`PermissionGuard`).
- 13 arquivos de Controller — novo Guard + decorator de classe.
- `apps/api/src/seed.ts` — catálogo de 13 códigos concedido a ambas as Roles.
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum dado existente perde acesso — o seed é atualizado para conceder o catálogo completo às Roles já existentes antes (ou junto com) a ativação dos Guards; qualquer Organization/Role criada antes desta missão e nunca re-seedada ficaria sem nenhuma Permission nova e passaria a receber `403` em toda rota protegida — mitigação: reexecutar `node dist/seed.js` (idempotente) concede o catálogo às Roles seed existentes.

## Status

Aceito
