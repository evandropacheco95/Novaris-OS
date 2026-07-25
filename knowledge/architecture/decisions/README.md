# NOVARIS — Architecture Decisions

## Purpose

Decisões formais de arquitetura de negócio (Business/Product/Domain Layer) — ownership de conceito, posição de Aggregate, congelamento de domínio, reconciliação Produto×Domínio, consolidação de estado de plataforma e posição de "CRM" no Domain Layer. Cada documento aqui representa uma decisão já tomada, com evidência citada, distinta de uma investigação em aberto (`../analysis/`) ou de um princípio de processo (`../governance/`).

## Scope

Cobre:
- Ownership de conceitos de negócio já catalogados (`DOMAIN_OWNERSHIP.md`).
- Candidatos a Aggregate por Bounded Context (`AGGREGATE_DISCOVERY.md`).
- Reconfirmação de domínios já congelados (`IDENTITY_DESIGN_FREEZE.md`).
- Reconciliação entre Product Layer e Domain Layer (`PRODUCT_DOMAIN_ARCHITECTURE.md`).
- Consolidação do estado geral da plataforma (`NOVARIS_PLATFORM_ARCHITECTURE.md`).
- Decisão formal sobre a posição de "CRM" (`ADR-0011-crm-domain-position.md`).

Não cobre:
- O registro sequencial oficial de ADRs da plataforma — isso é `adr/` (índice único, `adr/README.md`). `ADR-0011-crm-domain-position.md` é uma exceção nomeada, registrada e não reconciliada — ver nota abaixo.
- Investigação de evidência anterior a uma decisão — isso é `../analysis/`.
- Princípios de processo, forward-looking — isso é `../governance/`.

## Document Inventory

| Documento | Missão | Decisão |
|---|---|---|
| [DOMAIN_OWNERSHIP.md](DOMAIN_OWNERSHIP.md) | ENG-0012, atualizado por ENG-0020 | Owner de ~95 conceitos de negócio; 27 permanecem `Ownership Pending CTO Decision` após a resolução de `Queue` |
| [AGGREGATE_DISCOVERY.md](AGGREGATE_DISCOVERY.md) | ENG-0013 | Aggregate candidatos por Bounded Context; 7 perguntas de design em aberto |
| [IDENTITY_DESIGN_FREEZE.md](IDENTITY_DESIGN_FREEZE.md) | ENG-0014 | Reconfirmação do Identity Domain contra o código real, zero divergência encontrada |
| [PRODUCT_DOMAIN_ARCHITECTURE.md](PRODUCT_DOMAIN_ARCHITECTURE.md) | ENG-0016 | Reconciliação dos 9 produtos de `PRODUCTS.md` contra os 13 domínios de `DOMAIN_MODEL.md` — `ARCHITECTURE REQUIRES ADDITIONAL DECISIONS` |
| [NOVARIS_PLATFORM_ARCHITECTURE.md](NOVARIS_PLATFORM_ARCHITECTURE.md) | ENG-0017, atualizado por ENG-0020 | Consolidação de todo o estado de arquitetura conhecido — `ARCHITECTURE PARTIALLY FROZEN` |
| [ADR-0011-crm-domain-position.md](ADR-0011-crm-domain-position.md) | ENG-0019 | "CRM" confirmado como Product Layer, sem Bounded Context próprio |

⚠️ **Nota sobre `ADR-0011`**: este documento usa a nomenclatura `ADR-NNNN` mas vive fora do índice sequencial único de `adr/README.md`, por instrução literal de `ENG-0019`. `adr/ADR-0012-queue-ownership.md` (ENG-0020), decisão irmã e consequência direta desta, já registra a mesma fragmentação do lado do índice principal. Não reconciliado — ver `ADR-0011-crm-domain-position.md § Nota de Numeração e Localização`.

## Navigation References

- [../README.md](../README.md) — visão geral da árvore `knowledge/architecture/`
- [adr/README.md](../../../adr/README.md) — índice sequencial oficial de ADRs, incluindo `ADR-0012` (consequência direta de `ADR-0011`)
- [../analysis/README.md](../analysis/README.md) — investigações que precedem estas decisões (`CRM_DOMAIN_DISCOVERY.md` → `ADR-0011`)
- [../governance/ARCHITECTURE_GOVERNANCE.md](../governance/ARCHITECTURE_GOVERNANCE.md) — princípios aplicados nestas decisões ("Evidence Before Freeze", "Product ≠ Domain")
- [knowledge/core/DOMAIN_MODEL.md](../../core/DOMAIN_MODEL.md) — fonte canônica citada em toda decisão desta pasta

## Relationship with NOVARIS Architecture

Cada documento aqui é uma decisão vinculante dentro do escopo em que foi tomada, mas nenhum tem precedência sobre `DOMAIN_MODEL.md` ou sobre um ADR sequencial de `adr/` — a ordem de precedência (`NOVARIS_PLATFORM_ARCHITECTURE.md § 4`) coloca `ADRs → DOMAIN_MODEL.md` acima de qualquer documento estratégico desta pasta. Onde uma decisão aqui interage com um ADR sequencial (como `ADR-0011`/`ADR-0012`), a relação é registrada explicitamente em ambos os lados, nunca silenciosamente.

## Status

🟢 Estrutura documentada (Missão ENG-0021). Nenhum código, Aggregate, Entity, `DOMAIN_MODEL.md` ou ADR alterado por esta missão.
