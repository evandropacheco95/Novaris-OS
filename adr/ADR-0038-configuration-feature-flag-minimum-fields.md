# ADR-0038 — Configuration/Feature Flag: Resolução do "Discovery Required" e Campos Mínimos

## Problema

`services/kernel/README.md § Classificação Arquitetural` (`ENG-0007`, `KERNEL_BOUNDARY_REVIEW.md`) marca `configuration` e `feature-flags` como **"Discovery Required"** — candidatos a Domain Capability (risco de conterem regra de negócio de `Organization`, RN007), "não devem ser tratados como Infrastructure até uma Discovery formal decidir". Nenhuma Discovery formal (nos moldes de `ORGANIZATION_DOMAIN_DISCOVERY.md`/`PERMISSION_DOMAIN_DISCOVERY.md`) foi aberta para nenhum dos dois. Esta ADR faz essa resolução de forma leve, pelo mesmo critério já usado em `ADR-0025`/`ADR-0030`/`ADR-0032`/`ADR-0033`/`ADR-0034` (campos mínimos quando a evidência é rasa, mas suficiente para um Aggregate simples sem inventar regra de negócio).

## Contexto

- `BOM.md` **não tem nenhuma entrada para "Configuration"** — não existe como Business Object nomeado em nenhuma fonte oficial. Isso pesa a favor de Infrastructure genérica (armazenar pares chave/valor por organização), não de um conceito de negócio com regras próprias.
- `BOM.md § Feature Flag`: "Controle de funcionalidades." — one-liner, sem campos, sem regra, mesma situação de `Dashboard`/`Campaign` antes de `ADR-0033`/`ADR-0034`.
- Nenhuma fonte (`NOVARIS_OS.md`, `PRODUCTS.md`, `DOMAIN_MODEL.md`) atribui `Configuration`/`Feature Flag` a nenhum dos 10 Business Domains — ambos vivem exclusivamente em `services/kernel/`, nunca foram propostos como domínio de negócio.
- **Diferença desta ADR em relação às anteriores da mesma família**: `ADR-0025`/`0030`/`0032`/`0033`/`0034` foram precedidas por uma pergunta direta ao CTO sobre o campo mínimo. Esta ADR foi escrita sem essa confirmação explícita, sob a ordem direta "Faça todas as outras que faltam" (continuação de `ENG-0139`) — mitigado por escolher a interpretação mais genérica e reversível possível (par chave/valor puro; nenhuma regra de negócio específica de nenhum produto é assumida). Registrado aqui para transparência, não escondido.

## Decision Drivers

- Um par chave/valor por organização (`Configuration`) e um par chave/booleano por organização (`Feature Flag`) são a forma mínima estruturalmente necessária para qualquer um dos dois conceitos funcionar — não é uma escolha de conteúdo de negócio, é a definição do próprio conceito ("configuração" pressupõe chave+valor; "feature flag" pressupõe chave+estado ligado/desligado).
- Mesmo critério de `ADR-0028` (Workspace): `Organization` já cobre a responsabilidade central de identidade/perfil da organização — `Configuration`/`Feature Flag` não duplicam nada de `Organization`, só adicionam um mecanismo de extensão dinâmica (chave arbitrária) que `Organization` (Aggregate com campos fixos) não pode oferecer sem alterar seu próprio schema a cada nova necessidade.
- Nenhum enum, nenhuma lista fechada de chaves válidas é definida aqui — `key: string` livre, mesma disciplina de não inventar um catálogo de configurações/flags que nenhuma fonte já nomeou.

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. Aggregate mínimo chave/valor por organização, sem catálogo fechado de chaves** | `ConfigurationEntry { organizationId, key, value }`, `FeatureFlag { organizationId, key, enabled }` | Escolhida — mesmo padrão de campo mínimo já usado 5 vezes nesta engenharia |
| B. Abrir uma Discovery formal completa (Bounded Context, Aggregate Design Freeze, Technical Blueprint) para cada um | Processo completo, nos moldes de `ORGANIZATION_DOMAIN_DISCOVERY.md` | Rejeitada nesta rodada — nenhuma evidência de complexidade de negócio real que justifique o processo completo; ambos são estruturalmente triviais (par chave/valor) |
| C. Não implementar, manter "Discovery Required" em aberto | Deixar os dois módulos como estão | Rejeitada — contradiz a ordem direta de completar os módulos de Kernel restantes; não há razão concreta para bloquear algo estruturalmente trivial |

## Decision

**Opção A.**

- **`ConfigurationEntry`** (Aggregate Root, `@novaris/configuration`): `organizationId: UniqueEntityId`, `key: string` (não vazio), `value: string`. Unicidade: um `ConfigurationEntry` por `(organizationId, key)` — `set()` é upsert (cria se não existe, substitui `value` se já existe), nunca duplica linha.
- **`FeatureFlag`** (Aggregate Root, `@novaris/feature-flags`): `organizationId: UniqueEntityId`, `key: string` (não vazio), `enabled: boolean`. Mesma semântica de upsert.
- Nenhum Domain Event para nenhum dos dois — mesmo critério de `Campaign`/`Dashboard` (`ADR-0033`/`ADR-0034`): nenhuma fonte confirma um evento oficial para nenhum dos dois conceitos.
- Nenhum catálogo fechado de chaves válidas — `key` aceita qualquer string não vazia; validar contra um catálogo fixo seria inventar um requisito de produto que nenhuma fonte definiu.

## Rejected Alternatives

Ver Opções B e C acima.

## Consequences

- `services/kernel/README.md § Classificação Arquitetural` — `configuration`/`feature-flags` deixam de ser "Discovery Required", passam a **Infrastructure Capability com código real**.
- Duas novas tabelas Postgres (`configuration_entries`, `feature_flags`), cada uma com índice único `(organization_id, key)`.
- Nenhum enum de chave é fixado — validação de negócio sobre "quais chaves existem" fica para quem consome (ex.: um futuro `PermissionGuard`-equivalente para features), não para o Aggregate.

## Responsável

Decisão de arquitetura direta (Claude Code / Principal Engineer), sob ordem do CTO ("Faça todas as outras que faltam", continuação de `ENG-0139`/`ADR-0037`) — **sem confirmação explícita de campo mínimo desta vez**, diferente do precedente de `ADR-0025`/`0030`/`0032`/`0033`/`0034`. Reversível sem custo: nenhuma regra de negócio específica foi assumida além da forma estrutural de chave/valor.

## Data

2026-07-24

## Impactos

- `services/kernel/configuration/src/**`, `services/kernel/feature-flags/src/**` (novo código).
- `packages/database/prisma/schema.prisma` — 2 novos models + migrations.
- `apps/api/src/organization/` — novas rotas (`GET/PUT /organizations/me/config/:key`, `GET/PUT /organizations/me/feature-flags/:key`).
- `services/kernel/README.md`, `KERNEL_BOUNDARY_REVIEW.md` — reclassificação.
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum dado existente é migrado — tabelas novas, vazias.

## Status

Aceito
