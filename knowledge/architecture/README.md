# NOVARIS — Architecture

## Purpose

Estratégia de arquitetura de negócio (Business Domain Architecture) da NOVARIS: mapeamento de Bounded Contexts, canonicalização de domínio, relacionamentos estratégicos (Strategic DDD) e as decisões, análises e princípios de governança derivados deles. Criada a partir de `ENG-0009` (EPIC-007 — Business Domain Discovery) para consolidar, num único local, tudo o que antes estava disperso entre `DOMAIN_MODEL.md`, `PRODUCTS.md`, `SYSTEM_ARCHITECTURE.md` e as decisões pontuais de cada Epic de domínio (Identity, Organization, Permission, Audit, Event Bus).

## Scope

Cobre:
- Mapeamento e canonicalização de Bounded Contexts de negócio (`DOMAIN_CONTEXT_MAP.md`, `DOMAIN_CANONICALIZATION.md`).
- Relacionamentos estratégicos entre contextos (`CONTEXT_RELATIONSHIPS.md`).
- Decisões formais de arquitetura de domínio/produto (`decisions/`).
- Investigações e Discoveries de evidência, anteriores a uma decisão (`analysis/`).
- Princípios e processos de governança arquitetural, forward-looking (`governance/`).
- Especificações técnicas de implementação, consolidando Discovery/Aggregate Design/ADRs por domínio (`blueprints/`).
- Padrões de implementação específicos de Business Domain, extensões dos padrões gerais de `knowledge/engineering/standards/` (`standards/`).

Não cobre:
- O registro histórico e imutável de ADRs sequenciais da plataforma inteira — isso é `adr/` (índice único, `adr/README.md`).
- Arquitetura de implementação do Kernel (Domain/Infrastructure Capabilities já codificadas) — isso é `services/kernel/`.
- O documento canônico do Domain Layer em si — isso é `knowledge/core/DOMAIN_MODEL.md`, apenas referenciado aqui, nunca duplicado.

## Document Inventory

| Documento | Missão | Conteúdo |
|---|---|---|
| [DOMAIN_CONTEXT_MAP.md](DOMAIN_CONTEXT_MAP.md) | ENG-0009 | Mapeamento inicial de Bounded Contexts candidatos |
| [DOMAIN_CANONICALIZATION.md](DOMAIN_CANONICALIZATION.md) | ENG-0010 | Consolidação das 6 listas divergentes de domínio/produto em uma matriz única |
| [CONTEXT_RELATIONSHIPS.md](CONTEXT_RELATIONSHIPS.md) | ENG-0011, atualizado por ENG-0020 | Relacionamentos estratégicos (Strategic DDD) entre Bounded Contexts; decisão formal do CTO sobre 11 itens de nomenclatura/ownership |
| [decisions/](decisions/README.md) | ENG-0012 a ENG-0020 (ver README da subpasta) | Decisões formais de ownership, Aggregate Discovery, Identity Freeze, reconciliação Produto×Domínio, consolidação de plataforma, posição de CRM |
| [analysis/](analysis/README.md) | ENG-0015 (ver README da subpasta) | Investigações de evidência documental antes de qualquer Design Freeze |
| [governance/](governance/README.md) | ENG-0018 (ver README da subpasta) | Framework de governança arquitetural, forward-looking |
| [blueprints/](blueprints/README.md) | ENG-0036 (ver README da subpasta) | Technical Blueprints de implementação por domínio de negócio (`Sales`, primeiro caso) |
| [standards/](standards/README.md) | ENG-0038 (ver README da subpasta) | Extensões de Business Domain aos padrões de `knowledge/engineering/standards/` — não duplica, não substitui |

## Navigation References

- [knowledge/core/DOMAIN_MODEL.md](../core/DOMAIN_MODEL.md) — documento canônico do Domain Layer (fonte primária de todo documento nesta árvore)
- [knowledge/core/PRODUCTS.md](../core/PRODUCTS.md) — fonte do Product Layer
- [adr/](../../adr/README.md) — registro sequencial e imutável de ADRs da plataforma
- [services/kernel/KERNEL_BOUNDARY_REVIEW.md](../../services/kernel/KERNEL_BOUNDARY_REVIEW.md) — classificação Domain/Infrastructure do Kernel já implementado
- [knowledge/README.md](../README.md) — índice de categorias de `knowledge/`

## Relationship with NOVARIS Architecture

Esta árvore ocupa a camada de **arquitetura de negócio** (Business/Domain Layer), subordinada à ordem de precedência documental já formalizada (`ENG-0011` item 2, reafirmada em `NOVARIS_PLATFORM_ARCHITECTURE.md § 4`): **ADRs → `DOMAIN_MODEL.md` → `ENGINEERING_PLAYBOOK.md` → `PROJECT_RULES.md` → `SYSTEM_ARCHITECTURE.md` → READMEs → demais documentos estratégicos**. Nenhum documento desta árvore substitui ou tem precedência sobre `DOMAIN_MODEL.md` ou qualquer ADR — todos citam evidência, nenhum inventa decisão de domínio sem fonte. `governance/ARCHITECTURE_GOVERNANCE.md` consolida os princípios praticados por toda esta árvore; `decisions/NOVARIS_PLATFORM_ARCHITECTURE.md` é a fotografia mais recente do estado geral da plataforma (`ARCHITECTURE PARTIALLY FROZEN`).

## Status

🟢 Estrutura documentada (Missão ENG-0021 — Architecture Documentation Hygiene). Nenhum código, Aggregate, Entity, `DOMAIN_MODEL.md` ou ADR alterado por esta missão.
