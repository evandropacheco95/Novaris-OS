# NOVARIS — Architecture Standards

## Purpose

Padrões de implementação específicos de **Business Domains** (`services/domains/`) — distintos, mas nunca concorrentes, dos padrões de engenharia gerais já oficiais em `knowledge/engineering/standards/` (ENS-0001 a ENS-0003, `KERNEL_DOMAIN_LIFECYCLE_V2.md`), que nasceram no contexto do Kernel (`Identity`, `Organization`, `Audit`) e permanecem a autoridade única sobre as regras que já cobrem.

## Scope

Cobre:
- Extensões e aplicações específicas de Business Domain de padrões já congelados (ex.: como `AGGREGATE_IMPLEMENTATION_STANDARD.md` de `knowledge/engineering/standards/` se aplica a domínios com múltiplos Aggregates relacionados por composição, como `Sales`).
- Pontes explícitas entre os artefatos de `../analysis/`, `../decisions/`, `../blueprints/` e os padrões de implementação já existentes.

Não cobre, e nunca duplica:
- Nenhuma regra já definida por `knowledge/engineering/standards/` — esta pasta **estende**, nunca **substitui ou reescreve**, um padrão já congelado. Ver nota de colisão de nome em [`AGGREGATE_IMPLEMENTATION_STANDARD.md`](AGGREGATE_IMPLEMENTATION_STANDARD.md).
- Decisões de arquitetura (`../decisions/`, `adr/`) ou investigação de evidência (`../analysis/`).

## Document Inventory

| Documento | Missão | Relação com `knowledge/engineering/standards/` |
|---|---|---|
| [AGGREGATE_IMPLEMENTATION_STANDARD.md](AGGREGATE_IMPLEMENTATION_STANDARD.md) | ENG-0038 | **Não substitui** `knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md` (ENS-0001, congelado desde EPIC-002) — estende, para Business Domains, o que ENS-0001 não cobria (múltiplos Aggregates relacionados, referências cross-domínio de negócio, relação com Blueprint) |

## Relation with `../analysis/`

Um padrão desta pasta é validado contra a evidência já reunida em `../analysis/` (Discovery, Aggregate Design) — nunca a contradiz. Se `../analysis/` registra uma pergunta em aberto (`Needs Evidence`), nenhum padrão aqui a resolve por conta própria.

## Relation with `../decisions/`

Um padrão desta pasta cita, mas nunca substitui, as decisões formais já tomadas em `../decisions/` e `adr/` (ex.: `ADR-0021`, sobre a natureza de `Pipeline` como Configuration Aggregate) — aplica a regra de implementação a essas decisões, não as reabre.

## Relation with `../blueprints/`

Um Blueprint (`../blueprints/`) consolida decisões arquiteturais de um domínio específico; um Standard desta pasta define **como** implementar o que o Blueprint descreve, de forma reutilizável por qualquer domínio, não só o que motivou sua criação (`Sales`, neste caso).

## Navigation References

- [../README.md](../README.md) — visão geral da árvore `knowledge/architecture/`
- [knowledge/engineering/standards/README.md](../../engineering/standards/README.md) — padrões de engenharia gerais, autoridade única sobre o que já cobrem
- [knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md](../../engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001) — padrão canônico, não duplicado aqui
- [../blueprints/SALES_TECHNICAL_BLUEPRINT.md](../blueprints/SALES_TECHNICAL_BLUEPRINT.md) — primeiro Blueprint de Business Domain, motivador desta pasta

## Relationship with NOVARIS Architecture

Esta pasta não introduz nenhuma regra que contradiga um padrão já congelado — qualquer aparente conflito entre um documento aqui e `knowledge/engineering/standards/` deve ser resolvido a favor do documento em `knowledge/engineering/standards/`, e registrado, nunca silenciosamente ignorado (mesma disciplina de "Single Source of Truth", `ARCHITECTURE_GOVERNANCE.md § 2`).

## Status

🟢 Estrutura criada (Missão ENG-0038). Nenhum código, Entity, Aggregate ou padrão já congelado alterado.
