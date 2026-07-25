# ADR-0028 — Workspace Domain: `Organization` é a implementação completa; `Team`/`Plan`/`Storage`/`Environment` formalmente adiados

## Problema

`DOMAIN_OWNERSHIP.md § 54-57` mantém `Workspace`, `Team`, `Plan`, `Storage`, `Environment` como **"Ownership Pending CTO Decision"** desde `ENG-0012` — nenhum nunca fechado. Sem uma decisão explícita, esses itens permaneceriam indefinidamente em um estado intermediário, nem implementados nem formalmente descartados. Esta ADR fecha a pendência.

## Contexto

- `ENG-0011` item 4 (já decisão do CTO, citada em `DOMAIN_OWNERSHIP.md § 59`) confirmou: `Workspace` **não é mais sinônimo do domínio** — se existir como conceito próprio, seria interno a `Organization`, forma nunca definida.
- `Organization` (Aggregate Root do Kernel) já está **implementado de ponta a ponta** (`ENG-0003.7`-`0003.10`, `ENG-0122`, `ENG-0128`): Domain, Infrastructure real (Prisma/Supabase), Application, API (`GET`/`PATCH /organizations/me`), Frontend (`/settings`). Isso já cobre inteiramente a responsabilidade central do Workspace Domain em `DOMAIN_MODEL.md` ("Organizações, Times, Espaços, Configurações, Branding, Planos, Billing, Storage, Feature Flags") na parte que tem evidência real: identidade e perfil de uma empresa-tenant.
- `Team`: `DEC-ORG-004` já registrou como "candidato a Aggregate Root próprio, nunca confirmado" — nenhuma fonte define campos, ciclo de vida ou regra de negócio.
- `Plan`: `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 16` já registrou "natureza (VO vs. Aggregate) nunca decidida" — nenhum valor, nível ou regra de billing associada definida em nenhuma fonte.
- `Storage`/`Environment`: citação única em `DOMAIN_MODEL.md`, sem qualquer detalhamento em `BOM.md`/`UBIQUITOUS_LANGUAGE.md`.
- `Subscription`/`Billing` — já resolvidos como pertencentes a **Financial**, não Workspace (`ADR-0027`, `ENG-0011` item 7) — não avaliados aqui.

## Decision Drivers

- Diferente de `Party` (`ADR-0025`), onde um campo óbvio e universalmente necessário (`name`) estava faltando por omissão, `Team`/`Plan`/`Storage`/`Environment` não têm sequer um caso de uso concreto documentado — implementá-los agora exigiria inventar toda a estrutura de dados, não apenas um campo faltante.
- `Organization` já resolve a necessidade real e imediata (identidade da empresa-tenant) — não há, hoje, nenhuma tela, endpoint ou fluxo de negócio que dependa de `Team`/`Plan`/`Storage`/`Environment` existirem.
- Adiar formalmente (em vez de deixar "pending" para sempre) é mais honesto do que inventar uma estrutura sem caso de uso real, e mais claro do que manter a incerteza aberta indefinidamente.

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. Fechar `Workspace` = `Organization`; adiar formalmente os demais 4** | Confirma que a implementação já existente resolve o domínio; declara `Team`/`Plan`/`Storage`/`Environment` fora de escopo até uma necessidade de negócio concreta os justificar | Escolhida |
| B. Inventar estrutura mínima para os 4 conceitos agora | Ex.: `Team { name, memberIds }`, `Plan { tier }` | Rejeitada — nenhuma fonte sustenta esses campos; seria fabricar regra de negócio, violação direta da disciplina já aplicada em toda esta engenharia |
| C. Manter "Ownership Pending" indefinidamente | Não decidir nada | Rejeitada — o CTO pediu explicitamente para resolver as pendências; manter em aberto para sempre não é uma resolução |

## Decision

**Opção A.**

- **`Workspace` (domínio)**: sua responsabilidade central está **completamente coberta** pela implementação já existente de `Organization` (Kernel) — nenhum Aggregate `Workspace` separado será criado.
- **`Team`, `Plan`, `Storage`, `Environment`**: formalmente **adiados** — não são implementados, não têm Owner de Domain Layer atribuído além de "candidato interno a `Organization`, se algum dia confirmado". Retomar exige uma nova missão de Aggregate Design **quando houver um caso de uso de negócio real e concreto** (ex.: um cliente pedindo multi-equipe dentro de uma Organization) — não antes.

## Rejected Alternatives

Ver Opções B e C acima.

## Consequences

- `DOMAIN_OWNERSHIP.md § 54-57` — as 4 linhas recebem nota de resolução não-destrutiva (adiado, não "Ownership Pending" perpétuo).
- `apps/web`'s sidebar (`DashboardShell`) já rotula "Workspace" como habilitado, apontando para `/settings` (perfil de `Organization`) — este ADR confirma retroativamente que essa era a interpretação correta.
- Nenhuma mudança de código — `Organization` já implementado permanece como está.

## Responsável

CTO / Arquiteto Chefe — decisão explícita ("pode resolver as pendências").

## Data

2026-07-23

## Impactos

- `knowledge/architecture/decisions/DOMAIN_OWNERSHIP.md § 54-57` — nota de resolução não-destrutiva.
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum.

## Status

Aceito
