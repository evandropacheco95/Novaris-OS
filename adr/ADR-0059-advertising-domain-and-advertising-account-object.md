# ADR-0059 - Advertising como 11º Business Domain Ativo + Object Specification de AdvertisingAccount

## Problema

Ao iniciar a Fase 01 (Foundation) do roadmap de `NOVARIS Performance Intelligence` ([ADR-0058](ADR-0058-novaris-performance-intelligence-product.md)), a investigação do código real revelou que o mapeamento provisório de `specifications/performance-intelligence/database.md` ("Campaign/AdGroup/Ad/Asset → Marketing") está errado: `Campaign` (Marketing Domain) tem campos mínimos congelados por [ADR-0033](ADR-0033-marketing-campaign-minimum-fields.md) — só `name`, `startDate`, `endDate` — sem `externalId`, `budget`, `status`, plataforma ou métricas. Não serve para representar uma conta de anúncio ou campanha sincronizada de uma plataforma externa (Google Ads). Era preciso decidir onde os objetos realmente novos (Advertising Account, Ad Campaign sincronizada, Ad Group, Keyword, Search Term, Sync Run) deveriam morar, e `NOVARIS_CONSTITUTION.md Article V` ("é proibido criar tabelas, APIs ou telas antes da existência da Object Specification correspondente") exige resolver isso antes de qualquer código de Fase 01.

## Contexto

- `DOMAIN_MODEL.md` (v1.3, reconciliado por `ENG-0024`/`ENG-0026`/`ENG-0028`) lista hoje **10 Business Domains ativos**: `Identity`, `Workspace`, `Relationship`, `Sales`, `Activity`, `Project`, `Marketing`, `Financial`, `Analytics`, `System`. Nenhum deles reivindica Advertising Account/Ad Campaign externa/Ad Group/Keyword/Search Term/Sync Run como objeto próprio.
- `ADR-0007` (usado em `ADR-0058` para justificar Performance Intelligence como Product Layer sem pasta de domínio) estabelece explicitamente o teste inverso do que se aplicou: *"antes de criar `services/domains/<produto>/` para qualquer novo produto, verificar primeiro se ele tem objetos de dados próprios no BOM (é um domínio) ou se é composição de domínios existentes"*. `Growth` não tinha objetos próprios — por isso virou produto puro. Performance Intelligence **tem** objetos próprios genuínos, sem dono em nenhum domínio ativo — o teste do próprio `ADR-0007`, aplicado corretamente, aponta para a conclusão oposta à que `ADR-0058` tirou sobre a camada de dados (o `ADR-0058` continua correto sobre Performance Intelligence ser **Product Layer**; o erro estava em assumir que toda a Domain Layer subjacente já existia).
- `NOVARIS_CONSTITUTION.md Article II` (Source of Truth) e `Article V` (Business Objects) exigem Object Specification antes de qualquer tabela/API/tela; `Article IV` exige que toda implementação pertença a um domínio.
- `BOM.md § 5` já cataloga ~65 objetos, a maioria sem Object Specification individual (`knowledge/core/objects/`); só 8 têm arquivo próprio hoje (`Organization`, `User`, `Role`, `Permission`, `Opportunity`, `Pipeline`, `Stage`, `Proposal`). Catalogar um objeto novo no BOM sem escrever sua Object Specification completa é o padrão já aceito no repositório (a maioria dos 65 objetos está nesse estado) — só a implementação de tabela/API/tela exige a especificação completa primeiro.
- `RequireDomain`/`PlanGuard` (`ENG-0164`) usam um conjunto fechado de 10 chaves de domínio, ligado à sidebar do frontend e ao plano contratado da Organization — Controllers de Kernel/infraestrutura sem entrada na sidebar (`ai-runtime`, `integration-hub` etc.) deliberadamente não usam `@RequireDomain()`.

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| A. Manter só composição (sem domínio próprio), forçar os novos objetos para dentro de `Marketing`/`Analytics` como estão | Sem mudança estrutural | Rejeitada — `Campaign` tem campos mínimos congelados por `ADR-0033`; alterá-los agora revogaria uma decisão congelada e afetaria todo consumidor existente de `Campaign`, só para acomodar um conceito (campanha sincronizada de plataforma externa) que é semanticamente diferente de uma campanha interna de marketing |
| B. Criar um domínio novo `services/domains/advertising/`, 11º Business Domain ativo, dono dos objetos realmente novos | Segue exatamente o teste do próprio `ADR-0007` | Escolhida |

## Escolha

**Opção B.**

- **Advertising** passa a ser o 11º Business Domain ativo em `DOMAIN_MODEL.md`, responsável por: conexão com plataformas de mídia paga, contas de anúncio, campanhas/grupos/palavras-chave/termos de busca sincronizados, execuções de sincronização. Objetos: `Advertising Account` (implementado nesta missão), `Ad Campaign` (sincronizada — distinta de `Campaign`/Marketing), `Ad Group`, `Keyword`, `Search Term`, `Sync Run` — os últimos 5 catalogados em `BOM.md` mas **sem** implementação nem Object Specification própria ainda (ficam para a Fase 02, cada um com sua própria Object Specification antes do código correspondente, por `Article V`).
- **`Company`/`Business Profile`** (fronteira que `ADR-0058`/`database.md` haviam deixado em aberto) é resolvida por **eliminação**: não vira objeto novo. Winnet Metais e Allbinox Metais tornam-se, cada uma, sua própria `Organization` (tenant) já existente no Kernel — `name`/`legalName`/`document`/`address` de `Organization` já cobrem o que `Business Profile` precisaria. Isso é reaproveitamento direto, não invenção de objeto.
- Object Specification completa escrita para **`AdvertisingAccount`** (`knowledge/core/objects/AdvertisingAccount.md`, 20 capítulos, seguindo `OBJECT_SPECIFICATION_TEMPLATE.md`) — único objeto que o código desta missão implementa, desbloqueando-o por `Article V`.
- `BOM.md § 5` ganha uma nova subseção `ADVERTISING OBJECTS` com os 6 objetos listados acima.
- Código real criado: `services/domains/advertising/` (pacote `@novaris/advertising`, mesma estrutura DDD de `@novaris/marketing`), `AdvertisingAccount` Aggregate Root, Repository (port + adapter Prisma), Application Layer (`CreateAdvertisingAccountCommand`/`Handler`), `AdvertisingAccountController` (`POST`/`GET /performance-intelligence/ad-accounts`) montado em `apps/api`. **Sem `@RequireDomain("Advertising")`** — mesmo tratamento dado a Controllers de Kernel/infraestrutura sem entrada na sidebar (`PlanGuard` não afeta rotas sem esse decorator); entrada na sidebar/plan-gating fica para a Fase 12 (Dashboard/UX), quando a tela real existir.
- Schema Prisma (`AdvertisingAccount`) adicionado a `packages/database/prisma/schema.prisma` e migration correspondente **escrita, mas não aplicada** ao banco — aplicar uma migration é ação com efeito em infraestrutura compartilhada (Supabase de produção, já usado por `apps/api/src/seed.ts`), fora do que pode ser decidido sem confirmação explícita do usuário.
- `specifications/performance-intelligence/database.md` corrigido para refletir este ADR (não mais "Campaign/AdGroup/Ad/Asset → Marketing").

## Consequências

- `DOMAIN_MODEL.md` passa de 10 para 11 Business Domains ativos — primeira adição de domínio novo (não histórico) desde a reconciliação `ENG-0024`/`ENG-0026`.
- Performance Intelligence (Product Layer, `ADR-0058`) agora tem uma Domain Layer própria e correta por baixo — deixa de depender de um reaproveitamento forçado de `Campaign`/`Marketing` que não cabia nos campos congelados por `ADR-0033`.
- Os 5 objetos restantes (`Ad Campaign`, `Ad Group`, `Keyword`, `Search Term`, `Sync Run`) continuam bloqueados por `Article V` até cada um ganhar sua própria Object Specification — nenhuma tabela/API é criada para eles nesta missão.
- `Advertising` ainda não participa de `enabledDomains`/sidebar/plan-gating — qualquer Organization pode usar as rotas de `AdvertisingAccount` hoje, sem restrição de plano, até a Fase 12 decidir isso deliberadamente.

## Responsável

Decisão de arquitetura direta (Claude Code / Principal Engineer), aplicando o teste já estabelecido pelo CTO em `ADR-0007` aos objetos reais descobertos durante a implementação da Fase 01 — autorizado pela instrução explícita do usuário nesta sessão para prosseguir e ir em profundidade na Fase 01.

## Data

2026-09-01

## Impactos

- `novaris/knowledge/core/DOMAIN_MODEL.md` — nova seção `ADVERTISING DOMAIN`, contagem de domínios ativos atualizada (10 → 11).
- `novaris/knowledge/core/BOM.md` — nova subseção `ADVERTISING OBJECTS` (6 objetos).
- `novaris/knowledge/core/objects/AdvertisingAccount.md` (novo) — Object Specification completa.
- `novaris/knowledge/core/objects/README.md` — nova linha no catálogo.
- `novaris/specifications/performance-intelligence/database.md` — mapeamento corrigido.
- `novaris/services/domains/advertising/` (novo pacote `@novaris/advertising`) — Aggregate, Repository, Application Layer, Infrastructure, testes.
- `novaris/packages/database/prisma/schema.prisma` — novo `model AdvertisingAccount`.
- `novaris/packages/database/prisma/migrations/20260901150000_advertising_account/` (nova, **não aplicada**).
- `novaris/apps/api/src/advertising/` (novo) — Controller + Module, registrado em `app.module.ts`.

## Plano de Migração

Nenhum dado existente é afetado — `AdvertisingAccount` é uma tabela nova, sem relação com dados hoje existentes. A migration foi escrita seguindo a convenção de nome (`YYYYMMDDHHMMSS_descrição`) mas **não foi executada** contra o banco (produção via Supabase) — requer confirmação explícita do usuário antes de aplicar.

## Status

Aceito
