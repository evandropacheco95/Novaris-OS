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

## Tópicos a Documentar

Estes 3 itens são o que falta para NOVARIS se tornar um SaaS multi-tenant "completo" no sentido Salesforce (Edições/Licenças) — nenhum tem decisão de produto tomada ainda, por isso seguem como `TODO` explícito, não implementados por invenção:

- **Plano/limites por tenant** — `Organization` **deliberadamente não tem** `plan`/`billingStatus`/`trialEnd`/`maxUsers`/`maxStorage`/`storageUsed`/`featureFlags`/`settings` (excluídos conscientemente da primeira implementação, comentário em `services/kernel/organizations/src/domain/aggregates/organization/organization.ts:41-50` — "nenhum tem valor ou forma de criação definida por nenhuma fonte"). `Organization.status` (`active`/`suspended`/`trial`/`blocked`/`archived`) já existe e cobre o ciclo de vida básico, mas sem plano/tier associado, todo tenant é funcionalmente idêntico hoje.
- **Estratégia de billing por tenant** — ver [docs/12-negocio/billing-e-assinaturas.md](../docs/12-negocio/billing-e-assinaturas.md). `services/domains/financial` (`Invoice`/`Subscription`) existe como Domain Layer per-cliente-do-cliente (a própria Organization vende para os *seus* clientes via CRM/Financial) — não é o mesmo conceito de "NOVARIS cobra a Organization pelo uso da plataforma", que ainda não tem nenhum objeto de domínio.
- **Migração/exportação de dados de um tenant** — nenhum endpoint ou processo existe hoje para exportar/portar os dados de uma Organization.

## Status

🟡 Documentado o que existe de verdade (`ENG-0162`) — isolamento real via `loadAndAssertOwnership`, RLS como defesa em profundidade inerte, provisionamento só por seed. Os 3 tópicos pendentes acima permanecem sem decisão de produto — não inventados aqui.
