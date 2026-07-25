# NOVARIS — Architecture Governance

## Purpose

Framework de governança arquitetural forward-looking: consolida todos os princípios, regras e processos já praticados nesta engenharia (EPIC-007 e anteriores) em uma referência única para decisões futuras, distinta do registro de decisões já tomadas (`../decisions/`).

## Scope

Cobre:
- Princípios nomeados de arquitetura (ex.: "Evidence Before Freeze", "Product ≠ Domain") com seu precedente de origem citado.
- Processos obrigatórios já em vigor (relatórios por tipo de missão, Link Checker, Mission ID, `KERNEL_DOMAIN_LIFECYCLE_V2.md`).

Não cobre:
- Decisões individuais já tomadas — isso é `../decisions/`.
- Investigações de evidência — isso é `../analysis/`.
- Regras de precedência documental de toda a plataforma (fora do escopo de Produto/Domínio/Kernel) — isso é `PROJECT_RULES.md § Matriz de Autoridade Documental`.

## Document Inventory

| Documento | Missão | Conteúdo |
|---|---|---|
| [ARCHITECTURE_GOVERNANCE.md](ARCHITECTURE_GOVERNANCE.md) | ENG-0018 | 10 seções: princípios nomeados, processos obrigatórios, papéis, checklist de nova Discovery de domínio |
| [ARCHITECTURE_BASELINE_V3.md](ARCHITECTURE_BASELINE_V3.md) | ENG-0022.2 | Inventário oficial de Kernel/Business Domains/Capability Layers/Infrastructure Capabilities, vocabulário canônico, avaliação de prontidão para Aggregate Design |
| [DOCUMENTATION_INTEGRITY_AUDIT.md](DOCUMENTATION_INTEGRITY_AUDIT.md) | DOC-0002 | Auditoria de integridade documental: núcleo de governança confirmado saudável; 5 formulações concorrentes de "o que é a NOVARIS" encontradas e resolvidas por [ADR-0023](../../../adr/ADR-0023-company-identity-statement-consolidation.md) |
| [MISSION_REGISTRY.md](MISSION_REGISTRY.md) | DOC-0002 | Registro append-only de todo Mission-ID já usado; revelou 4ª colisão (`EPIC-001`); base para [ADR-0024](../../../adr/ADR-0024-domain-and-product-count-consolidation.md) (10 Business Domains + 9 produtos) |

## Navigation References

- [../README.md](../README.md) — visão geral da árvore `knowledge/architecture/`
- [../decisions/NOVARIS_PLATFORM_ARCHITECTURE.md](../decisions/NOVARIS_PLATFORM_ARCHITECTURE.md) — estado consolidado da plataforma, onde os princípios desta pasta são aplicados
- [../analysis/CRM_DOMAIN_DISCOVERY.md](../analysis/CRM_DOMAIN_DISCOVERY.md) — precedente de origem do princípio "Evidence Before Freeze"
- [adr/ADR-0007-domain-boundaries.md](../../../adr/ADR-0007-domain-boundaries.md) — precedente de origem do princípio "Product ≠ Domain"
- [knowledge/engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md](../../engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md) — processo oficial de todo novo domínio, referenciado por este framework

## Relationship with NOVARIS Architecture

Este framework não introduz nenhum princípio novo sem precedente real — cada item nomeado aqui cita a missão/documento onde foi praticado pela primeira vez. Não tem precedência sobre `DOMAIN_MODEL.md`, ADRs ou `PROJECT_RULES.md` — é um consolidador de prática já estabelecida, para uso por toda missão futura de arquitetura de domínio/produto.

## Status

🟢 Estrutura documentada (Missão ENG-0021). Nenhum código, Aggregate, Entity, `DOMAIN_MODEL.md` ou ADR alterado por esta missão.
