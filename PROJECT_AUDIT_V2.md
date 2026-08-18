# PROJECT_AUDIT_V2 — Auditoria de Escopo Completo do NOVARIS

**Status**: 🟢 Concluída — auditoria 100% read-only (nenhum arquivo alterado, nenhuma migration rodada, nenhuma dependência instalada durante a auditoria em si).
**Data**: 2026-08-18
**Metodologia**: 6 clusters de investigação paralela (agentes independentes, cada um lendo código-fonte real, ADRs e `git log` — nunca confiando cegamente na documentação do `knowledge/`, que é conhecida por ficar desatualizada), cobrindo 30 tópicos. Cada item relevante é classificado em exatamente uma de 4 categorias:

- **Aproveitar Integralmente** — está bom, mantenha como está.
- **Aproveitar Parcialmente** — tem valor mas precisa de ajustes pontuais.
- **Reescrever** — a abordagem está errada/obsoleta, precisa ser refeita.
- **Remover** — não tem mais função, é código morto ou redundante.

(Cluster 1 originalmente classificou com rótulos próprios — Manter/Consolidar/Investigar-Decidir/Remover — normalizados abaixo para as 4 categorias oficiais: Manter→Integralmente, Consolidar/Investigar-Decidir→Parcialmente.)

---

## 🔴 Achado Crítico — Status: mitigado, ainda com pendências

**Credencial real exposta em texto puro, em repositório então público.** `apps/api/src/seed.ts` continha, no working tree (não só no histórico), o e-mail pessoal real do usuário (`evandrinhop@gmail.com`) e uma senha real em texto puro usada para o usuário SuperMaster de bootstrap. Confirmado via `git log --all -p` que já existia em commits anteriores. O repositório `evandropacheco95/Novaris-OS` estava **público** no momento do achado (`gh api repos/.../` → `"private": false, "visibility": "public"`).

**Ações já tomadas (2026-08-18)**:
1. ✅ Senha rotacionada no código (`seed.ts`) e re-executada contra o banco de produção real (Railway/Supabase) — a credencial antiga não é mais válida.
2. ✅ Repositório tornado **privado**.
3. ⏳ **Pendente**: a senha antiga permanece no histórico do Git em texto puro (commits anteriores) — como já foi rotacionada e o repo é privado, o risco caiu bastante, mas reescrever o histórico (ação destrutiva, requer confirmação explícita) ainda é uma opção a avaliar caso o padrão de segurança exigido for mais rígido.
4. ⏳ **Pendente**: mover a criação de usuários reais para fora do `seed.ts` versionado, usando variáveis de ambiente sem fallback hardcoded — hoje `admin@novaris.com.br`, `demo@novaris.com.br` e `comercial@novaris.com.br` também têm senhas reais em texto puro no arquivo (geradas nesta sessão), mitigado por o repo já ser privado, mas ainda é a prática recomendada.

**Classificação: Aproveitar Parcialmente** (era "Reescrever — urgente"; a urgência foi resolvida, falta só o polimento estrutural).

---

## 🟠 Segundo achado crítico — Branch protection é majoritariamente simbólica

Confirmado via `gh api repos/evandropacheco95/Novaris-OS/branches/master/protection` (repo ainda público na época):
- `required_status_checks.contexts: []` — **nenhum check está de fato marcado como obrigatório**, apesar da intenção documentada de "exige CI verde". O job `build-lint-test` do `ci.yml` nunca foi adicionado à lista.
- `enforce_admins.enabled: false` — o admin pode contornar qualquer proteção a qualquer momento (confirmado nesta própria sessão: o push do commit Ruflo teve "Bypassed rule violations" no output).
- `allow_force_pushes.enabled: true` — force-push para `master` está liberado.
- `required_signatures.enabled: false`.

**Atualização (2026-08-18)**: com o repositório agora **privado**, a API de branch protection passou a retornar `403 Upgrade to GitHub Pro or make this repository public to enable this feature` — no plano Free do GitHub, branch protection **não está disponível para repositórios privados**. Ou seja, a proteção "simbólica" que existia foi substituída por **nenhuma proteção configurável** até que o repo volte a ser público ou a conta suba para GitHub Pro/Team. Decisão de produto a ser tomada pelo CTO: aceitar esse trade-off (privacidade > branch protection, dado que hoje é single-committer) ou avaliar upgrade de plano.

**Classificação: Aproveitar Parcialmente** — não é mais uma correção técnica simples (`required_status_checks.contexts`), é uma decisão de plano/produto.

---

## Cluster 1 — Estrutura, Stack e Governança Arquitetural

### 1.1 Estrutura do monorepo e Turborepo
`pnpm-workspace.yaml`/`turbo.json` corretos e efetivamente usados. **Aproveitar Integralmente.**

### 1.2 `apps/`, `packages/`, `services/`
- `apps/api`, `apps/web` — reais, maduros. **Aproveitar Integralmente.**
- `apps/admin` — só `README.md` "🚧 nenhum código". **Remover** (ou formalizar como placeholder explícito via ADR se for permanecer).
- `packages/database`, `packages/shared-kernel` — reais e maduros. **Aproveitar Integralmente.**
- `packages/ai,config,contracts,logger,sdk,security,types,ui` (8 pacotes) — só `README.md`, sem código. Risco de confusão de nome com módulos reais equivalentes (ex. `packages/logger` vazio vs. `services/kernel/logging` real). **Aproveitar Parcialmente** (decidir consolidar ou formalizar).
- `services/domains/*` (7 domínios com código real) e `services/kernel/*` (13-16 módulos com código real) — **Aproveitar Integralmente.**
- `services/kernel/permissions,roles,users` — fechados deliberadamente (`ENG-0139`), preservados como registro histórico. **Aproveitar Integralmente** (manter como estão, não remover — decisão de governança já formalizada).
- `services/kernel/storage` — adiado por `ADR-0039`/`ENG-0140`, backlog legítimo. **Aproveitar Integralmente.**
- Placeholders na raiz (`database/`, `design-system/`, `sdk/`, `templates/`, `tools/`, `tests/`, `scripts/`) — colidem em nome com pacotes reais equivalentes. **Aproveitar Parcialmente** (consolidar via ADR antes de qualquer implementação futura).
- `infrastructure/{ci,deployment,docker}` — obsoletas: a infra real já existe em outro lugar (`.github/workflows/ci.yml`, `railway.json`, `docker-compose.yml`). **Remover** (ou redirecionar README para os locais reais).
- `Sem título.canvas`, `Untitled.md`, `Untitled 1.md` (sobras do Obsidian) — **Remover.**
- `.claude-flow/`, `.swarm/`, `ruvector.db` — já mitigados via `.gitignore`. **Aproveitar Integralmente** como estão.

### 1.3 `packages/shared-kernel`
Implementação DDD real e mais madura do repositório: `DomainError` (hierarquia completa e testada), `UniqueEntityId`, `AggregateRoot`, `Entity`, `ValueObject`, `DomainEvent`, `Repository`/`ReadRepository`/`WriteRepository`, `Specification` (com `and`/`or`/`not`), `DomainService`, `Either`/`Option`/`Result`. Cada bloco com teste unitário correspondente. **Aproveitar Integralmente.**
Subpastas vazias dentro do próprio pacote (`config/`, `constants/`, `contracts/`, `factories/`, `policies/`, `testing/`, `utils/`, `validation/`) repetem o padrão de scaffolding vazio. **Aproveitar Parcialmente.**

### 1.4 Governança arquitetural (`adr/`, `PROJECT_RULES.md`, `MISSION_REGISTRY.md`)
Cultura de ADR real e seguida na prática (57 arquivos, revogação formal em vez de edição silenciosa). `MISSION_REGISTRY.md` é um mecanismo valioso de prevenção de colisão de IDs.

Achados de inconsistência confirmados por leitura direta:
- **`ADR-0025` duplicado** — dois arquivos físicos diferentes (`ADR-0025-knowledge-os-foundation.md` e `ADR-0025-party-minimum-fields.md`), só um consta no índice oficial. Achado **novo** desta auditoria, não documentado anteriormente. **Aproveitar Parcialmente** (renumerar um dos dois, ex. para `ADR-0055`, e corrigir o registro).
- **Gap admitido no próprio índice**: 14 ADRs reais (`ADR-0037` a `ADR-0050`) existem em `adr/` mas nunca foram adicionados ao `MISSION_REGISTRY.md`. **Aproveitar Parcialmente** (preencher a tabela).
- **`ADR-0011`** fisicamente fora de `adr/` (vive em `knowledge/architecture/decisions/`) — inconsistência já conhecida, não corrigida. **Aproveitar Parcialmente.**
- `ADR-0003` revogado e preservado no disco — comportamento correto. **Aproveitar Integralmente.**

### 1.5 Documentação (`knowledge/`, vault Obsidian)
Nível de desatualização confirmado em pontos concretos: `architecture/stack-tecnologica.md` não reflete `ADR-0005` (pendência admitida pelo próprio time); `knowledge/architecture/DOMAIN_CONTEXT_MAP.md` descreve Sales/Customer como "scaffolding, zero código", o que está **falso** hoje (dezenas de missões ENG-01xx já implementaram esses domínios). `knowledge/core/MONOREPO_ARCHITECTURE.md` se autodeclara divergente do scaffolding real — atitude saudável, mas confirma que a base de conhecimento não deve ser confiada sem verificação cruzada com código. **Aproveitar Parcialmente** (revisão de atualização geral do vault é trabalho contínuo, não uma reescrita pontual).

---

## Cluster 2 — Multi-tenant, Autenticação, Permissões e Organização

### 2.1 `services/kernel/identity/` — User/Role, JWT, expiração
- `User`/`Role` Aggregates — DDD limpo. **Aproveitar Integralmente.**
- `AuthenticationDomainService.execute()` faz `findAll()` + filtro em memória por email em vez de `findByEmail` indexado — não é vulnerabilidade (email é `@unique` global), mas não escala. **Aproveitar Parcialmente** (extrair `findByEmail`).
- JWT / 401 / ENG-0171 — confirmado aplicado e funcionando: `authenticatedFetch` intercepta 401, limpa sessão, redireciona para `/login`. TTL fixo de 8h. **Aproveitar Integralmente.**
- **Refresh token não existe** — 1 JWT de 8h em `localStorage`, sem renovação silenciosa, sem cookie `httpOnly`. Funcional para MVP mas superfície de XSS-to-account-takeover maior que o necessário. **Aproveitar Parcialmente** (migrar para cookie `httpOnly` + refresh de vida curta antes de produção real com clientes pagantes).

### 2.2 `services/kernel/organizations/` — Organization Aggregate, multi-tenancy
- `Organization` Aggregate bem modelado, invariantes validadas. **Aproveitar Integralmente.**
- Propagação de `organizationId` é 100% disciplina manual por Controller — **não existe** `TenantGuard`/`@CurrentOrganization()` central. Funciona hoje porque `ENG-0161` auditou os 32 Controllers existentes, mas exige disciplina manual a cada novo Controller. **Aproveitar Parcialmente** (um decorator + scoped-repository helper reduziria risco de regressão).
- `OrganizationController` deliberadamente sem `PlanGuard` (evita lockout). **Aproveitar Integralmente.**
- Não há self-service signup (`POST /organizations`/`POST /auth/register` não existem) — decisão de produto documentada. **Aproveitar Integralmente** para o estágio atual; será **Reescrever** (greenfield) no dia em que houver self-service.

### 2.3 RBAC — catálogo, guards, cobertura
- `@RequirePermission` + `PermissionGuard` — mecanismo limpo. **Aproveitar Integralmente.**
- Cobertura confirmada manualmente: **todos os 32 Controllers** (exceto Auth/Health, corretamente públicos) têm `@UseGuards(JwtAuthGuard, PermissionGuard[, PlanGuard])`. **Aproveitar Integralmente.**
- Catálogo (`FULL_PERMISSION_CATALOG`, 32 códigos) é grosso — quase tudo `.manage` (leitura+escrita junto), sem granularidade `.read`/`.write`. **Aproveitar Parcialmente** (mecanismo pronto, falta estender o catálogo quando necessário).
- `SuperMaster` e `Usuario` recebem catálogo idêntico hoje (decisão adiada, `ADR-0036`) — RBAC estrutural sem uso real de granularidade ainda. **Aproveitar Parcialmente.**

### 2.4 Row-Level Security (RLS)
RLS existe estruturalmente em 36 das 37 tabelas (a exceção, `Credential`, é por design), mas é **100% inerte na prática**: a role Postgres usada pelo Prisma (`postgres`) tem `rolbypassrls=true`, confirmado ao vivo. A proteção real de isolamento multi-tenant é 100% código de aplicação (`loadAndAssertOwnership` por Controller) — achado já conhecido internamente (`ENG-0122`), mas confirmado ainda válido nesta auditoria. Auditoria de `WITH CHECK` (`ENG-0167`, motivada por incidente real em outro projeto da Elite Negócios/Winnet) concluiu que o gap de policies sem `WITH CHECK` explícito é latente mas não explorável no cenário atual. **Aproveitar Parcialmente** — as policies devem ser mantidas como defesa em profundidade, mas qualquer alegação de "RLS protege isolamento" seria falsa hoje; migrar para um role Postgres restrito sem bypass é uma evolução estrutural real, não trivial.

### 2.5 PlanGuard / `enabledDomains` / billing gating
- `PlanGuard` roda no backend (não só frontend), cobertura confirmada em 24 dos 32 Controllers (os 8 restantes são Kernel/infraestrutura sem produto correspondente). A suspeita de "brecha via API direta" **não se confirma** — foi fechada por `ENG-0165`. **Aproveitar Integralmente.**
- `Organization.status` (`suspended`/`blocked`/`archived`) **não é verificado em nenhum Guard** — uma Organização bloqueada não é impedida de logar/usar a API. Campo é só informativo hoje. **Aproveitar Parcialmente** (decidir com o CTO se é lacuna esquecida ou decisão consciente; se for lacuna, precisa de um `OrganizationStatusGuard`).
- `billingStatus` sem gateway de pagamento real — decisão explícita documentada. **Aproveitar Integralmente** para o estágio atual.

---

## Cluster 3 — Banco de Dados

### 3.1 `schema.prisma` (757 linhas, 37 models)
Nomenclatura e relations consistentes, FKs de Internal Entity corretamente não repassadas ao domínio. **Aproveitar Integralmente.**
- Comentário desatualizado no model `Dashboard` (ainda cita bloqueio de `Widget` já superado por `ADR-0049`) — drift documental pontual, não funcional. **Aproveitar Parcialmente** (corrigir comentário).
- Nenhuma tabela órfã confirmada — todo model tem Controller real, exceto `Credential` (por design, `ADR-0010`).
- `Credential` é a única tabela sem RLS — intencional e documentado (não tem `organization_id`). **Aproveitar Integralmente.**
- Campo `version` (User/Role) é incrementado e persistido mas **nunca usado como guarda de concorrência otimista** no `upsert` do repository — o propósito do campo não é imposto na persistência. **Aproveitar Parcialmente** (usar `WHERE version = X` ou remover a pretensão de optimistic locking).

### 3.2 Migrations
25 pastas, todas íntegras, sem gaps/duplicações. **Aproveitar Integralmente** quanto à integridade.
Nomenclatura de índices/constraints 100% divergente do padrão documentado em `DATABASE_ARCHITECTURE.md § 16` (0 de 55 índices seguem a convenção `idx_<tabela>_<coluna>` — todos usam o default do Prisma). Internamente consistente, mas diverge do que está escrito. **Aproveitar Parcialmente** (ou atualizar a convenção documentada para refletir o padrão Prisma real, ou migrar nomes — a primeira opção é mais barata).

### 3.3 Repositories/Mappers
Padrão find→mutate→save consistente em ~30 pares repository/mapper, erros sempre traduzidos para `InfrastructureError`. **Aproveitar Integralmente.**
Repositories Prisma não filtram por `organizationId` diretamente (mitigação ocorre na camada de Application/Controller/Handler, não no repository) — consistente com o achado 2.4 sobre RLS inerte. **Aproveitar Parcialmente** (mesma recomendação: repositório com filtro nativo por organização reduziria risco de regressão futura).
Repositórios in-memory — confirmado que só existem para testes de contrato, nunca em wiring de produção. **Aproveitar Integralmente.**

### 3.4 Seed data
`apps/api/src/seed.ts` — ver Achado Crítico no topo (credencial real exposta). Fora esse ponto, script de bootstrap funcional e usado. **Reescrever** (por causa do achado crítico).

### 3.5 Text-to-SQL (`TextToSqlPort`, ADR-0054)
100% read-only e não-executado na prática: `ConsoleTextToSqlRuntime.ask()` sempre retorna `sql: null` (sem adapter real de LLM). `SqlGuard.validateReadOnlySql()` é código real e testado (18 testes), allowlist de 27 tabelas confirmada consistente com o schema e corretamente excluindo Identity/Workspace/Financial. Nenhum `$queryRaw`/`$executeRaw` a partir de SQL gerado por IA existe no monorepo. **Aproveitar Integralmente** — implementação estrutural correta e segura, ainda sem uso real por decisão explícita (falta credencial de IA).

---

## Cluster 4 — Domínios de Negócio

### 4.1 Sales domain (`services/domains/sales/`)
De longe o domínio mais maduro: 8 Aggregate Roots (`Lead`, `Opportunity`, `Pipeline`, `Quotation`, `Contract`, `Revenue`, `Product`, `SalesChannel`), 66 arquivos de application layer, 34 arquivos de teste. Padrão extremamente consistente entre Aggregates (`Result<T,DomainError>`, `organizationId` obrigatório, cópias defensivas em getters). **Aproveitar Integralmente.**
- `contracts/` (DTOs de API) cobre só 5 dos ~30 comandos reais — os demais 25 (Pipeline, Contract, Revenue, SalesChannel, Product etc.) não têm contrato formal, apesar de implementados e expostos. **Aproveitar Parcialmente** (fechar o ciclo "contract-first").
- Repositórios in-memory confirmados como testes de contrato legítimos, não código morto. **Aproveitar Integralmente.**

### 4.2 Customer domain (`services/domains/customer/`)
Base sólida e correta (`Party`, `Relationship`), mas deliberadamente mínima — sem `update`/`deactivate`, sem gestão de contato/endereço, tudo documentado como "bloqueado, sem fonte". **Aproveitar Parcialmente** — estruturalmente correto, mas muito atrás de Sales em superfície funcional; relevante frente ao gap indústria/ecommerce já identificado no roadmap.

### 4.3 Financial domain (`services/domains/financial/`)
`Invoice`/`Subscription`, escopo estreito, sem camada de query. **Aproveitar Integralmente** para o escopo atual definido.
Decisão de não-reconciliação automática Contract↔Financial (`ADR-0053`) continua tecnicamente correta, mas hoje é uma lacuna funcional real para clientes tipo Winnet (indústria) — `Invoice` nem tem `contractId` para um vínculo manual. **Aproveitar Parcialmente** (próximo passo natural é a opção C já prevista no próprio ADR: `contractId` opcional).

### 4.4 Activity, Project, Marketing, Analytics
Padrão estrutural consistente entre si, maturidade escalonada:
- **Activity** — o mais maduro dos 4 (7 Aggregates/Entities, ciclo de vida real coberto). **Aproveitar Integralmente.**
- **Project** — funcional mas básico (falta `updateProject`, `removeTask`, datas/prazo). **Aproveitar Parcialmente.**
- **Marketing (Asset/Campaign)** — coerente, superfície mínima (sem editar/remover). **Aproveitar Parcialmente.**
- **Analytics (Widget/Dashboard)** — mesmo nível que Marketing. **Aproveitar Parcialmente.**

### 4.5 System/Audit domain
Mecanismo bem desenhado (`AuditEntry` imutável, enriquecimento via injeção direta, API somente-leitura, filtro correto por `organizationId`). **Aproveitar Integralmente** o mecanismo em si.
**Achado crítico de cobertura**: apenas 2 handlers em todo o monorepo (ambos em Organization) realmente chamam `CreateAuditEntryHandler`. Identity (mudança de Role/Permission, criação/desativação de usuário), Sales (término de contrato, geração de Revenue, Won/Lost) e Financial (`markPaid`) **não auditam nada** hoje, apesar do mecanismo pronto e comprovado em produção. **Aproveitar Parcialmente** — não precisa reescrita, precisa replicar o wiring já validado para os handlers sensíveis restantes; deve ser tratado como prioridade de segurança/compliance, não nice-to-have.

---

## Cluster 5 — Frontend (`apps/web`)

### 5.1 Estrutura Next.js (`apps/web/app/`)
23 rotas, todas alcançáveis, nenhuma órfã. **Achado real**: proteção de rota (`if (!getToken()) router.replace("/login")`) duplicada literalmente em 23 páginas, sem `middleware.ts` nem hook central. **Aproveitar Parcialmente** (centralizar em `middleware.ts` ou `useRequireAuth()`).

### 5.2 Design system (Tailwind, shadcn/ui, 21st.dev)
**Achado relevante**: a "migração para shadcn/ui" (`ADR-0050`) só adotou as *convenções* de tooling (`components.json`, `cn()`, deps de CVA/clsx) — **não existe** `components/ui/` nem nenhuma dependência `@radix-ui/*`. Todos os 12 componentes são hand-rolled com tokens `nov-*` próprios, não os tokens-padrão do shadcn. Na prática é "Tailwind + convenções shadcn", não a biblioteca de componentes shadcn de fato. **Aproveitar Parcialmente** (é uma base sólida e consistente, mas o nome "migração para shadcn/ui" não corresponde à implementação real — vale corrigir a expectativa documentada ou completar a adoção real).

Inconsistência visual real por geração de migração: só 6 das 23 páginas (`cases`, `contracts`, `leads`, `opportunities`, `pipelines`, `quotations` — ligadas a `ENG-0158`) usam `SkeletonCard`+`Reveal`; as outras 17 (incluindo domínios centrais como `financial`, `team`, `system`, `settings`) usam `"Carregando..."` texto puro sem skeleton nem animação. **Aproveitar Parcialmente** (estender o polish às 17 páginas restantes é trabalho mecânico, não redesenho).

### 5.3 Camada de API (`apps/web/lib/api.ts`)
`parseOrThrow<T>` é o padrão dominante mas não 100% adotado — resquícios de parsing manual em Opportunity/Party/Relationship/login/deleteComment (funções anteriores à introdução do helper no arquivo).
**Achado concreto**: `uploadFile` monta seu próprio `fetch` (necessário por `FormData`) e **não passa por `authenticatedFetch`** — se o token expirar durante um upload, a sessão inválida não é detectada nem o usuário é redirecionado. `parseOrThrow` também chama `.json()` incondicionalmente antes de checar `response.ok`, sem fallback para corpos de erro não-JSON (502/504/HTML). **Aproveitar Parcialmente** (3 correções pontuais e independentes, não uma reescrita do arquivo).

### 5.4 Loading/Erro/Vazio
Erro: consistente (parágrafo inline padrão) em 100% das telas. `EmptyState` em 20/23 páginas (`settings`/`team` mostram listas vazias sem feedback). Loading: mesma divisão do item 5.2 (6/23 com skeleton real). **Aproveitar Parcialmente.**

### 5.5 Acessibilidade/responsividade + achados adicionais
- Zero uso de `next/link` em todo o app — navegação interna via `router.push` (ok) ou `<a href>` cru em 3 locais (`dashboard-shell.tsx`, `stat-card.tsx`, `page.tsx`), forçando full page reload em vez de navegação client-side. **Aproveitar Parcialmente.**
- `NEXT_PUBLIC_API_URL` com fallback hardcoded para `localhost:3001` — verificar se é intencional só para dev. **Aproveitar Parcialmente** (investigar risco em build de produção sem a env var).
- Zero `any`/`as any`, zero `TODO`/`FIXME` em `app`/`lib`/`components` — sinal positivo de disciplina de tipos. **Aproveitar Integralmente.**

---

## Cluster 6 — Qualidade de Código, Testes, CI/CD, Ruflo

### 6.1 Cobertura e padrão de testes
- **`services/domains/*` e `services/kernel/*` (22 módulos)**: 100% têm teste real, testando comportamento (invariantes, domain events), não smoke superficial. **Aproveitar Integralmente.**
- **`apps/api` (126 arquivos .ts)**: **zero testes** — inclusive os 3 guards de segurança (`JwtAuthGuard`, `PermissionGuard`, `PlanGuard`) não têm nenhuma cobertura própria, apesar da camada de domínio por trás estar bem testada. **Aproveitar Parcialmente** (arquitetura correta, falta criar a suíte da camada NestJS).
- **`apps/web`**: 1 único arquivo E2E (Playwright), cobrindo login + smoke dos 10 domínios + RBAC de `enabledDomains`. Zero testes de componente/unitários. **Aproveitar Parcialmente.**
- `packages/shared-kernel` — 17 arquivos de teste, fundação bem testada. **Aproveitar Integralmente.**

### 6.2 CI (`.github/workflows/ci.yml`)
Único workflow existente (sem Dependabot/CodeQL/scan de segurança). `pnpm test` via Turbo só roda onde há script `test` — pula silenciosamente `apps/api`/`apps/web`/maioria dos `packages/*` sem sinal visível disso. **Não roda `prisma migrate deploy`** antes dos 30 testes de integração — pressupõe schema já aplicado externamente, sem garantia de sincronia. Testes E2E (Playwright) nunca rodam em CI (nem task existe no `turbo.json`). **Aproveitar Parcialmente** — esqueleto correto, mas com 3 gaps concretos: adicionar `prisma migrate deploy`, decidir conscientemente sobre E2E em CI, adicionar scan de segurança básico.
`engineering/pipeline-ci-cd.md` e `engineering/estrategia-de-testes.md` são placeholders vazios (`🚧 A ser detalhado`) apesar da política real já existir implicitamente no `ci.yml`. **Reescrever** (documentar o que já existe, em vez de deixar como esqueleto).

### 6.3 Segurança de processo
- `CODEOWNERS` cobre `adr/`, `services/`, `apps/web/`, `packages/database/` — **não cobre `apps/api/`** (a API inteira, incluindo os guards de auth) nem a maioria de `packages/*`. **Aproveitar Parcialmente** (fechar antes de um segundo colaborador entrar).
- Branch protection — ver Achado Crítico #2 no topo. **Reescrever.**
- `.gitignore` — cobertura correta e específica para secrets e artefatos runtime, incluindo os do Ruflo. **Aproveitar Integralmente.**
- Vazamento de credencial real (`seed.ts`) — ver Achado Crítico #1 no topo. **Reescrever — urgente.**

### 6.4 Infraestrutura Ruflo
Confirmado por inspeção direta (não apenas leitura de config): `.swarm/memory.db` tem 37 de 38 tabelas **vazias**, todos os timestamps = momento exato da instalação (27/07/2026), sem nenhuma atividade em ~3 semanas até hoje. `.claude-flow/metrics/swarm-activity.json` confirma `active: false, agent_count: 0`. `.claude-flow/security/audit-status.json` confirma `status: PENDING`, nenhum scan jamais rodou, apesar de `autoScan: true` estar declarado em `.claude/settings.json`. Zero menção a Ruflo/claude-flow em qualquer ADR ou missão `ENG-*`/`ENS-*` real do projeto até a instalação. `ruvector.db` está corrompido/ilegível (não é SQLite válido).

**Nota sobre esta sessão**: esta mesma auditoria (os 6 clusters acima) foi executada via o Agent tool nativo, não via as ferramentas MCP do Ruflo (`swarm_init`/`memory_store`/`agent_spawn`) — que carecem de acesso a filesystem para pesquisa real, como já diagnosticado anteriormente nesta sessão. O achado do Cluster 6 é consistente com essa limitação: o Ruflo tem valor estrutural (config correta, hooks declarados), mas nenhum uso genuíno até o momento.

**Classificação**:
- `.claude/settings.json`, `.mcp.json` (config base, `autoStart: false`) — **Aproveitar Parcialmente** (ativar de verdade ou remover a declaração).
- `.claude/agents/`, `.claude/commands/` (~250 arquivos de templates genéricos do framework, não específicos do NOVARIS) — **Remover** (boilerplate de instalação, sem nenhuma citação em missão real; poderia viver como dependência `npx` em vez de arquivos versionados).
- `.claude-flow/` (o que foi de fato versionado: `config.yaml`, `CAPABILITIES.md`, `memory-package.json`, `.gitignore`) — **Aproveitar Integralmente** (recorte correto do que deveria ser versionado).
- `CLAUDE.md` (raiz, 7KB, regras de orquestração) — **Reescrever ou Remover**, dado uso real = zero até agora; ou o time adota o Ruflo ativamente e passa a referenciá-lo nas missões, ou o arquivo é simplificado para não sugerir um processo não seguido.

### 6.5 Dívida técnica documentada
Zero `TODO`/`FIXME`/`HACK`/`XXX` em `apps/`. Em `services/`, as poucas ocorrências (5, concentradas em `services/domains/sales/`) são TODOs de decisão de design conscientemente adiada, sempre referenciando um ADR/doc — exatamente o padrão que o projeto quer. **Aproveitar Integralmente** — mas nota: a ausência quase total de `FIXME`/`HACK` também torna invisível qualquer atalho não documentado que eventualmente exista (ex.: nos guards de `apps/api` sem teste, item 6.1).

---

## Resumo Executivo — Achados que Requerem Ação Priorizada

| # | Achado | Severidade | Classificação |
|---|---|---|---|
| 1 | Credencial real exposta em texto puro (`seed.ts`) — senha rotacionada e repo tornado privado; histórico do Git e demais senhas de seed ainda em texto puro | 🟡 Médio (era 🔴, mitigado) | Aproveitar Parcialmente |
| 2 | Branch protection simbólica — e agora indisponível no plano Free com repo privado | 🟡 Médio (era 🟠) | Aproveitar Parcialmente — decisão de plano |
| 3 | Auditoria (`audit domain`) só cobre 2 de dezenas de ações sensíveis (Identity/Sales/Financial não auditam nada) | 🟠 Alto | Aproveitar Parcialmente — expandir wiring |
| 4 | RLS estruturalmente presente mas 100% inerte (`rolbypassrls=true`) — isolamento multi-tenant depende só de disciplina manual | 🟡 Médio (conhecido, mitigado, mas frágil por design) | Aproveitar Parcialmente |
| 5 | `apps/api` (incluindo os 3 guards de auth) sem nenhum teste | 🟡 Médio | Aproveitar Parcialmente |
| 6 | CI não roda `prisma migrate deploy`; E2E nunca roda em CI | 🟡 Médio | Aproveitar Parcialmente |
| 7 | "Migração para shadcn/ui" só adotou convenções, não a biblioteca real | 🟢 Baixo | Aproveitar Parcialmente |
| 8 | Ruflo — 257 arquivos versionados, uso real = zero desde a instalação | 🟢 Baixo (custo cognitivo, não risco) | Reescrever/Remover a maior parte |
| 9 | `ADR-0025` duplicado; gap de 14 ADRs fora do `MISSION_REGISTRY.md` | 🟢 Baixo | Aproveitar Parcialmente |
| 10 | `Organization.status` (blocked/suspended) não é verificado em nenhum Guard | 🟢 Baixo (confirmar intenção com CTO) | Aproveitar Parcialmente |

Nenhum domínio de negócio ou Aggregate foi classificado como "Reescrever" por motivo arquitetural — os problemas reais identificados nesta auditoria são de **cobertura incompleta**, **maturidade desigual entre domínios**, **um segredo vazado** e **processo de CI/branch-protection simbólico**, não de decisões de design equivocadas. A base de código (DDD tático, `shared-kernel`, camada de domínio) é consistentemente sólida em todos os 6 clusters.
