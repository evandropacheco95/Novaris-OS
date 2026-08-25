# ADR-0056 - Enforcement de Feature Flag (`FeatureGuard`)

## Problema

`FeatureFlag` (`services/kernel/feature-flags`, `ADR-0038`) existe desde `ENG-0140` — Aggregate chave/booleano por Organization, com rotas reais (`GET/PUT /feature-flags/:key`) — mas nenhum Controller do NOVARIS o consulta e nenhuma tela do frontend o lê. A própria `ADR-0038` já previa essa lacuna: *"validação de negócio sobre 'quais chaves existem' fica para quem consome (ex.: um futuro `PermissionGuard`-equivalente para features), não para o Aggregate."* Esse consumidor nunca foi construído.

Separadamente, o CTO trouxe o CRM Allbinox como referência para elevar o NOVARIS a um controle de acesso mais granular que o já existente. `ENG-0164`/`ENG-0165` já resolveram gating de **domínio inteiro** por plano (`Organization.plan`/`enabledDomains` + `PlanGuard`/`@RequireDomain`) — mas isso só bloqueia um Business Domain completo (ex.: todo o Sales), nunca uma capability específica dentro dele. Confirmado com o CTO: falta granularidade abaixo do domínio.

## Contexto

- `FeatureFlag` já é estruturalmente exatamente o que esse gate precisa: par `(organizationId, key) → enabled`, sem catálogo fechado de chaves (`ADR-0038`).
- `PlanGuard`/`@RequireDomain` (`ENG-0164`/`165`) já é o precedente estrutural direto: `CanActivate` + `Reflector.getAllAndOverride` + decorator via `SetMetadata`, mas aplicado a nível de **classe** (Controller inteiro pertence a 1 domínio).
- `ENG-0164` já estabeleceu, por decisão explícita do CTO, que o nome do plano **nunca** implica limites/capabilities fixas — cada Organization configura os próprios limites (`maxUsers`, `enabledDomains`) individualmente. O mesmo raciocínio se aplica a features: nenhum catálogo estático `Plan → features` deve existir.
- Piloto escolhido com o CTO: `POST /ai/text-to-sql` (`ADR-0054`, `ENG-0170`), dentro do `AIRuntimeController`, que também expõe `POST /ai/ask` — gatear só `text-to-sql` prova a granularidade método-a-método (mais fina que Controller inteiro).

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. `FeatureGuard` + `@RequireFeature(key)`, method-level, consultando `FeatureFlag` já existente** | Reaproveita 100% o Aggregate/Repository/rotas já implementados; zero mudança de Domain; aplicado por método, não por Controller | Escolhida |
| B. Catálogo estático `Plan → features` (cada tier define um conjunto fixo de features habilitadas) | Contradiz a decisão já tomada em `ENG-0164` de nunca derivar capability do nome do plano; inventaria uma tabela sem fonte de produto | Rejeitada |
| C. Gate a nível de Controller inteiro (mesmo padrão de `@RequireDomain`) | Não resolveria o problema relatado — já existe via `PlanGuard`; não prova granularidade abaixo do domínio | Rejeitada |
| D. Aplicar o gate também em `POST /ai/ask` | Removeria o contraste vivo que prova que o mecanismo é por rota, não por domínio inteiro | Rejeitada |

## Escolha

**Opção A.**

- `apps/api/src/auth/require-feature.decorator.ts` (novo): `REQUIRED_FEATURE_KEY`, `RequireFeature(key: string)` via `SetMetadata` — mesma forma de `require-domain.decorator.ts`.
- `apps/api/src/auth/feature.guard.ts` (novo): `FeatureGuard implements CanActivate`. Sem `@RequireFeature()` no handler/classe → libera. Com chave: injeta `FEATURE_GUARD_FEATURE_FLAG_REPOSITORY`, chama `findByOrganizationAndKey(organizationId, key)`.
  - Falha de infraestrutura ou Organization não encontrada → libera (mesmo critério defensivo do `PlanGuard`: não é uma decisão de feature, é uma falha de infra que não deveria bloquear por um motivo que não é dela).
  - `FeatureFlag` encontrada com `enabled === true` → libera.
  - Não encontrada, ou encontrada com `enabled === false` → `403 ForbiddenException({ code: "FEATURE_RESTRICTION_ERROR" })`.
- **Semântica invertida em relação a `enabledDomains`**: ausência de `FeatureFlag` = **desabilitado por padrão** (opt-in), não "sem restrição". `enabledDomains` foi um retrofit sobre Organizations que já tinham acesso a tudo (não podia quebrar ninguém); um gate de feature novo, aplicado a uma rota já opcional/avançada e sem uso real ainda, é seguro começar fechado.
- `auth.module.ts`: novo token `FEATURE_GUARD_FEATURE_FLAG_REPOSITORY`, provider via `createFeatureFlagRepository(prisma)` (`@novaris/feature-flags`); `FeatureGuard` exportado, mesmo padrão de `PlanGuard`.
- Piloto: `AIRuntimeController.textToSqlAsk` ganha `@UseGuards(FeatureGuard)` + `@RequireFeature("ai-runtime.text-to-sql")` a nível de método. `ask` (mesma classe) permanece sem gate.
- Frontend: `/settings` (card de plano, `ENG-0164`) ganha um toggle que chama `PUT /feature-flags/ai-runtime.text-to-sql` — primeiro uso real de uma rota que existe desde `ADR-0038` sem nunca ter sido consumida.

## Consequências

- `FeatureFlag` deixa de ser um mecanismo órfão — ganha seu primeiro Controller consumidor real e sua primeira tela.
- Todo novo gate de feature futuro segue o mesmo padrão (`@RequireFeature("dominio.capability")`, convenção de chave adotada aqui: `<domínio-técnico>.<capability>`).
- Nenhum catálogo fechado de chaves é criado — mesma disciplina de `ADR-0038`, valida-se apenas a existência da `FeatureFlag` no Repository, não a chave contra uma lista fixa.
- Organizations existentes não são afetadas: a única rota gateada (`text-to-sql`) é nova (`ENG-0170`) e nunca teve uso real em produção (sem credencial de IA).

## Responsável

Decisão de arquitetura direta (Claude Code / Principal Engineer), sob confirmação explícita do CTO: granularidade abaixo do domínio como o gap real a fechar (não catálogo estático de plano, não onboarding self-service, não billing gateway), e `AI Runtime (text-to-sql)` como piloto.

## Data

2026-08-21

## Impactos

- `apps/api/src/auth/require-feature.decorator.ts`, `apps/api/src/auth/feature.guard.ts` (novos).
- `apps/api/src/auth/auth.module.ts` — novo provider/export.
- `apps/api/src/ai-runtime/ai-runtime.controller.ts` — `@UseGuards`/`@RequireFeature` em `textToSqlAsk`.
- `apps/web/app/settings/page.tsx` (ou equivalente) — novo toggle no card de plano.
- `knowledge/architecture/multi-tenancy.md`, `MISSION_REGISTRY.md` — nova entrada (`ENG-0172`).

## Plano de Migração

Nenhum dado existente migrado — `FeatureFlag` já existe como tabela vazia (nenhuma Organization jamais criou uma linha).

## Status

Aceito
