# ADR-0024 - Consolidação da Contagem Oficial de Domínios e Produtos

## Problema

Duas contagens divergentes já estavam registradas como pendência em `PROJECT_RULES.md`, nunca resolvidas por decisão explícita do CTO: (1) quantos **Business Domains** (Domain Layer) a NOVARIS possui — 10 confirmados em `DOMAIN_MODEL.md` vs. 15 listados em `SYSTEM_ARCHITECTURE.md § 5`; (2) quantos **produtos** (Product Layer) a NOVARIS vende — 6 em `NOVARIS_OS.md § 7` vs. 9 em `PRODUCTS.md`.

## Contexto

**Domínios**: `DOMAIN_MODEL.md` é o documento canônico do Domain Layer (`ENG-0011` item 1, reafirmado em toda a cadeia `ADR-0007`–`ADR-0023`). Seus 10 domínios ativos (`Identity`, `Workspace`/`Organization`, `Relationship`/`Customer`, `Sales`, `Activity`, `Project`, `Marketing`, `Financial`, `Analytics`, `System`) já são a base de **todo** trabalho técnico real desta engenharia — o único domínio com implementação profunda (`Sales`, congelado em `SALES_CONTRACTS_FREEZE_V2.md`) e o próximo já recomendado (`Relationship`/`Customer`, `RELATIONSHIP_DOMAIN_DISCOVERY.md`) pertencem a essa lista. `SYSTEM_ARCHITECTURE.md § 5` mistura, na mesma lista de "domínios oficiais", nomes de Product Layer já resolvidos como não-domínio (`CRM`, `Growth`, `Studio`, `Marketplace` — `ADR-0007`/`ADR-0011`/`ADR-0018`), Infrastructure/Transversal já resolvidos (`Automation`, `AI`, `Knowledge` — `ADR-0013`/`ADR-0014`/`ADR-0015`), e três nomes nunca avaliados (`Customer Success`, `Support`, `HR`).

**Produtos**: nem `NOVARIS_OS.md § 7` (6 produtos) nem `PRODUCTS.md` (9 produtos) têm conteúdo real além de `TODO` — nenhuma decisão de negócio depende hoje de nenhuma das duas contagens. `PRODUCTS.md` já registrava o conflito em seu próprio cabeçalho, pedindo resolução "antes de preencher os capítulos". O CTO, consultado diretamente (guiado por explicação em linguagem simples, dado que a decisão é de empacotamento comercial, não de arquitetura), escolheu **9 produtos separados** — `Financial`, `Projects` e `Analytics` vendidos como produtos próprios, não apenas recursos internos de `Growth`/`CRM`.

## Alternativas

### Domínios

- **Option A** — Manter as duas listas coexistindo. Rejeitada — já é pendência antiga, sem necessidade de permanecer aberta; todo trabalho real já escolheu implicitamente os 10.
- **Option B** — Escolher os 10 de `DOMAIN_MODEL.md` como oficiais, anotando `SYSTEM_ARCHITECTURE.md § 5` sem reescrevê-la. **Escolhida.**

### Produtos

- **Option A** — 6 produtos consolidados (`NOVARIS_OS.md`), com `Financial`/`Projects`/`Analytics` como recursos internos. Rejeitada pelo CTO.
- **Option B** — 9 produtos separados (`PRODUCTS.md`). **Escolhida pelo CTO.**

## Escolha

`DOMAIN_MODEL.md` é confirmado como a única fonte oficial de contagem de Business Domains: **10 domínios ativos**. `PRODUCTS.md` é confirmado como a única fonte oficial de contagem de produtos: **9 produtos** (`Growth`, `CRM`, `AI`, `Automation`, `Studio`, `Analytics`, `Projects`, `Marketplace`, `Financial`). `SYSTEM_ARCHITECTURE.md § 5` e `NOVARIS_OS.md § 7` são anotados de forma não-destrutiva — texto original preservado — apontando para as fontes agora oficiais.

## Consequências

**Positivas**: encerra duas pendências registradas há muito tempo em `PROJECT_RULES.md`, sem inventar conteúdo (`PRODUCTS.md` já tinha os 9 nomes; `DOMAIN_MODEL.md` já tinha os 10) — apenas formaliza qual conta é vinculante. Libera `PRODUCTS.md` para receber conteúdo real (`Objetivo`/`Escopo`/`Funcionalidades`/etc.) numa futura missão, sem o bloqueio que seu próprio cabeçalho já registrava.

**Negativas / pendências, fora de escopo**: `SYSTEM_ARCHITECTURE.md § 5` continua citando `Customer Success`, `Support` e `HR` — nomes nunca avaliados por nenhuma Discovery formal; permanecem `Not Confirmed`, não decididos por esta ADR. Nenhum conteúdo de `PRODUCTS.md` foi escrito por esta ADR — os 9 capítulos continuam `TODO`.

## Domain Impact

Nenhuma Entity, Aggregate, Value Object, Domain Event, Repository ou código foi criado/alterado.

## Responsável

Decisão de arquitetura (domínios): já implícita em todo trabalho técnico anterior, formalizada agora. Decisão de negócio (produtos): CTO, por escolha direta e explícita nesta sessão. Execução: Engenheiro Principal.

## Data

2026-07-22

## Impactos

Criado: este arquivo. Alterados (nota não-destrutiva): `knowledge/core/SYSTEM_ARCHITECTURE.md § 5`, `knowledge/core/NOVARIS_OS.md § 7`, `knowledge/core/PRODUCTS.md` (cabeçalho de conflito atualizado para resolvido), `PROJECT_RULES.md` (Emenda 33), `adr/README.md` (linha ADR-0024).

## Plano de Migração

Não aplicável — nenhum código ou dado depende de nenhuma das duas contagens hoje.

## Status

Aceito

---

## Relação com Outros Módulos

- [ADR-0023](ADR-0023-company-identity-statement-consolidation.md) — resolução irmã, mesma sessão, mesmo padrão não-destrutivo
- [DOMAIN_MODEL.md](../knowledge/core/DOMAIN_MODEL.md) — fonte oficial de domínios, agora confirmada sem ressalva de contagem
- [PRODUCTS.md](../knowledge/core/PRODUCTS.md) — fonte oficial de produtos, agora confirmada sem ressalva de contagem
- [RELATIONSHIP_DOMAIN_DISCOVERY.md](../knowledge/architecture/discovery/RELATIONSHIP_DOMAIN_DISCOVERY.md) — próximo domínio (dos 10) a avançar para Aggregate Design
