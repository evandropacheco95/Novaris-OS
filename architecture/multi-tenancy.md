# Multi-Tenancy

Estratégia de isolamento entre organizações/clientes (tenants) na plataforma NOVARIS.

> Este documento descreve o que **existe de verdade** hoje no código (`ENG-0122`, `ENG-0155`, `ENG-0161`) — não uma arquitetura aspiracional. Onde algo ainda não foi decidido/implementado, fica marcado como pendente explicitamente, mesma disciplina de `MASTER_ROADMAP.md`/`organization.ts`.

## Modelo de Isolamento

**Coluna `organization_id` + checagem em código de aplicação — não RLS, apesar de policies existirem no banco.**

Toda tabela multi-tenant tem uma coluna `organization_id` (FK real em algumas — `users`/`roles` — por id sem FK nas demais, ver `DATABASE_ARCHITECTURE.md`). O isolamento real acontece em 2 camadas, nesta ordem de importância:

1. **Camada real (código de aplicação)**: todo Controller que opera sobre uma entidade já existente (`GET/PATCH/POST /recurso/:id/...`) chama `loadAndAssertOwnership(id, user)` — busca a entidade pelo id, compara `entity.organizationId` contra o `organizationId` do JWT autenticado, e devolve `403` com `code: "NOT_FOUND_ERROR"` (nunca `403 FORBIDDEN` puro — mascarado propositalmente como "não encontrado" para não revelar a existência de dado de outra Organization) em caso de divergência. Padrão de referência: `OpportunityController.loadAndAssertOwnership` (`apps/api/src/sales/opportunity.controller.ts`), replicado em todos os 32 Controllers de `apps/api/src` (auditoria completa, `ENG-0161`) — rotas de listagem (`GET` sem `:id`) filtram por `organizationId` diretamente na query/no filtro em memória, nunca devolvem dado de outra Organization.
2. **Camada estrutural (Postgres, hoje inerte)**: RLS policies existem desde as migrations originais (`init_sales_domain`, `identity_organization_domain`) — mas **não protegem nenhuma query desta API**. Ver seção seguinte.

**Por que a camada de código é a real, e não RLS**: a conexão Prisma de `apps/api` usa o role `postgres` (dono/superusuário do schema no Supabase) — por padrão do próprio Postgres, RLS nunca se aplica ao dono de uma tabela, independente de quantas policies existirem. Achado real, confirmado via `SELECT rolbypassrls FROM pg_roles WHERE rolname = current_user` contra o Postgres real (`ENG-0122`).

**Nenhum Guard genérico substitui essa checagem.** `JwtAuthGuard` só popula `request.user` a partir do JWT; `PermissionGuard` consulta `AuthorizationDomainService` apenas com `userId` + `permissionCode` — o `organizationId` do *recurso alvo* nunca entra na conta em nenhum dos dois. `loadAndAssertOwnership` (ou o filtro equivalente na query de listagem) é a única barreira real, e precisa ser aplicado individualmente a cada Controller novo — não há middleware nem decorator que faça isso automaticamente hoje.

## Row Level Security (RLS)

Existe (policies reais nas migrations), mas é **defesa em profundidade para um cenário que não acontece hoje** — só protegeria um acesso feito por um role sem `rolbypassrls` (ex.: `anon`/`authenticated` do PostgREST do Supabase, ou um `service_role` restrito criado especificamente sem esse bypass). Esta arquitetura não usa PostgREST — a API fala com o Postgres diretamente via Prisma, sempre com o role com bypass — então, na prática, RLS nunca é o motivo pelo qual um dado de outra Organization não vaza. Ver `knowledge/core/DATABASE_ARCHITECTURE.md § 7` para o achado completo e `docs/09-seguranca/protecao-de-dados.md`.

**Verificado ao vivo** (`ENG-0161`): Organization + Lead de teste criados via Prisma direto numa 2ª Organization; tentativa de `POST /leads/:id/convert` contra esse Lead, autenticado como usuário de uma Organization diferente, corretamente bloqueada com `403 NOT_FOUND_ERROR` — pela checagem em código, não por RLS.

## Provisionamento de Novo Tenant

**Não existe fluxo de self-service hoje — decisão explícita, não uma lacuna esquecida.** `OrganizationController` (`apps/api/src/organization/organization.controller.ts`) documenta em comentário: "criar um novo tenant não é uma operação de usuário logado nesta fase; hoje só o seed de bootstrap cria Organizations" (`apps/api/src/seed.ts`) — não existe `POST /organizations`. Uma Organization nasce hoje de uma dessas 2 formas, ambas fora do produto:

1. `apps/api/src/seed.ts` — bootstrap manual (usado para o ambiente de desenvolvimento/demo).
2. Inserção direta via Prisma/SQL (usado, por exemplo, para os testes de isolamento cross-tenant de `ENG-0155`/`ENG-0161`).

Depois de criada, o único fluxo real de "entrada" para um usuário é `POST /auth/login` contra um `User` já existente e vinculado a essa `organizationId` — também não existe `POST /auth/register` (auto-cadastro).

## Plano/Limites por Tenant (`ENG-0164`)

`Organization` ganhou `plan` (`starter`/`professional`/`enterprise`, rótulo comercial — decisão direta do CTO), `billingStatus` (`trialing`/`active`/`overdue`/`canceled`, controle manual, sem gateway de pagamento real), `trialEnd` (informativo, sem bloqueio automático — decisão explícita do CTO), `maxUsers` e `enabledDomains` — estes 2 últimos **não** derivam de uma tabela fixa "plano→limite" (nenhum número/mapeamento foi inventado); são configuráveis por Organization, individualmente, via `PATCH /organizations/plan` (`workspace.plan.manage`, Permission distinta de `workspace.profile.manage`).

**Enforcement real, não só o campo**:
- `maxUsers` — `CreateUserHandler` (Identity) conta os `User`s existentes da Organization e bloqueia com `ConflictError` (`400`) se o limite já foi atingido. `undefined` = sem limite (comportamento de toda Organization anterior a esta missão, preservado).
- `enabledDomains` — a sidebar (`DashboardShell`, frontend) esconde os domínios não incluídos na lista. `undefined`/vazio = todos os 10 domínios visíveis (mesmo comportamento anterior).

**Limitação real, documentada e não escondida**: o enforcement de `enabledDomains` existe hoje **só no frontend** (a sidebar não mostra o link) — não há um Guard de backend bloqueando `GET/POST` direto num domínio fora do plano de uma Organization (ex.: chamar `POST /campaigns` mesmo sem `Marketing` em `enabledDomains` funcionaria hoje). Isso é diferente do isolamento entre Organizations (§ "Modelo de Isolamento" acima, que é real em toda camada) — aqui é só uma restrição de navegação, não de dado. Fechar isso exigiria um `PlanGuard` novo aplicado aos ~30 Controllers de domínio de negócio, deliberadamente fora do escopo desta missão (mesmo critério de nunca expandir escopo sem necessidade concreta já demonstrada).

`billingStatus` **não tem cobrança automática** — mesmo padrão estrutural de `integration-hub`/`ai-runtime` (`ADR-0040`/`ADR-0041`): nenhuma credencial de gateway de pagamento existe hoje, então nenhuma cobrança real acontece; o campo só reflete o que um humano define via API.

## Tópicos a Documentar

Restam 2 itens (o 3º, plano/limites, foi fechado em `ENG-0164` acima) para NOVARIS se tornar um SaaS multi-tenant "completo" no sentido Salesforce (Edições/Licenças):

- **Cobrança real (gateway de pagamento)** — ver [docs/12-negocio/billing-e-assinaturas.md](../docs/12-negocio/billing-e-assinaturas.md). `services/domains/financial` (`Invoice`/`Subscription`) existe como Domain Layer per-cliente-do-cliente (a própria Organization vende para os *seus* clientes via CRM/Financial) — não é o mesmo conceito de "NOVARIS cobra a Organization pelo uso da plataforma", que segue sem gateway real (`billingStatus` é manual, ver acima).
- **Migração/exportação de dados de um tenant** — nenhum endpoint ou processo existe hoje para exportar/portar os dados de uma Organization.
- **`PlanGuard` de backend** (novo, identificado em `ENG-0164`) — fechar o enforcement de `enabledDomains` também nas rotas de API, não só na sidebar.

## Status

🟡 Documentado o que existe de verdade (`ENG-0162`/`ENG-0164`) — isolamento entre Organizations real em toda camada via `loadAndAssertOwnership`; plano/limites (`maxUsers` real, `enabledDomains` só frontend) configuráveis por Organization, sem número/mapeamento inventado; RLS como defesa em profundidade inerte; provisionamento só por seed. Os itens pendentes acima permanecem sem decisão de produto ou fora de escopo — não inventados aqui.
