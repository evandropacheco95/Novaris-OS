# Services / Domains

## Objetivo

Domínios de negócio da NOVARIS, como serviços separados do Kernel ([ADR-0006](../../adr/ADR-0006-monorepo-structure-decision.md)), restritos a bounded contexts técnicos reais — não capacidades estratégicas/produto ([ADR-0007](../../adr/ADR-0007-domain-boundaries.md), Missão ENG-0000.2).

## Escopo (após ENG-0000.2)

`sales`, `customer`, `marketing`, `analytics`, `financial`, `projects` — só estrutura, nenhuma funcionalidade, nenhum código de negócio, nenhum serviço iniciado.

> **Nota de Atualização (`ENG-0120`–`ENG-0133`)**: o parágrafo acima descreve o estado logo após `ENG-0000.2` — hoje desatualizado. `sales`, `customer`, `financial`, `projects`, `activity`, `marketing` e `analytics` têm Domain/Application/Infrastructure/API/Frontend completos e testados contra Postgres real; ver `## Status` abaixo para o estado atual.

⚠️ **`growth` foi removido** (Missão ENG-0000.2): representava uma capacidade estratégica/produto ("NOVARIS Growth", já em `PRODUCTS.md`/`specifications/growth/`), não um bounded context técnico isolado — ver [ADR-0007](../../adr/ADR-0007-domain-boundaries.md) para a distinção entre Product Layer e Domain Layer.

`customer`, `marketing` e `analytics` foram adicionados nesta missão. `customer` corresponde ao "Relationship Domain" de `DOMAIN_MODEL.md` (nome ajustado para bounded context — a seção original de `DOMAIN_MODEL.md` não foi reescrita, só referenciada; ver nota em `DOMAIN_MODEL.md`); `marketing` e `analytics` já correspondiam a domínios nomeados em `DOMAIN_MODEL.md`.

## Domínios

- [sales/](sales/README.md)
- [customer/](customer/README.md)
- [marketing/](marketing/README.md)
- [analytics/](analytics/README.md)
- [financial/](financial/README.md)
- [projects/](projects/README.md)
- [activity/](activity/README.md)

Os outros domínios de `DOMAIN_MODEL.md` sem pasta própria aqui: Identity (já é `services/kernel/`), Workspace (coberto por `Organization`, também em `services/kernel/`, `ADR-0028`), Knowledge, AI, Automation, System (`ADR-0029`, adiado — `Audit` confirmado único fragmento real, sem implementação ainda).

## Relação com Outros Módulos

- [services/kernel/](../kernel/README.md) — infraestrutura consumida por estes domínios, nunca acessada diretamente (via [packages/contracts/](../../packages/contracts/README.md))
- [DOMAIN_MODEL.md](../../knowledge/core/DOMAIN_MODEL.md) — definição de domínio de origem
- [PRODUCTS.md](../../knowledge/core/PRODUCTS.md) — Product Layer; "Growth" vive lá, não aqui (ver [ADR-0007](../../adr/ADR-0007-domain-boundaries.md))
- [BOM.md](../../knowledge/core/BOM.md) — todo objeto de negócio destes domínios precisa de Object Specification antes de qualquer tabela (§ 1)

## Status

🟢 7 dos 7 pacotes de domínio criados nesta pasta têm Domain/Application/Infrastructure/API/Frontend completos e testados contra Postgres real: `sales` (`ENG-0120`-`0121`), `customer` (`ENG-0125`), `projects` (`ENG-0130`), `financial` (`ENG-0131`), `activity`/`marketing`/`analytics` (`ENG-0133`). Nenhum domínio nesta pasta permanece "só estrutura".
