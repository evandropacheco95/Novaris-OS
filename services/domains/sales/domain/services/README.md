# sales / domain / services

## Purpose

Local futuro de Domain Services de `Sales`, caso alguma regra de negócio venha a exigir colaboração entre múltiplos Aggregates ou dependência de Repository — nenhum identificado até o momento.

## Responsibilities

Um Domain Service só existe se envolver múltiplos Aggregates, depender de Repository, ou exigir consulta que nenhum Aggregate resolve sozinho (`DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md`, ENS-0003).

## Allowed Dependencies

`packages/shared-kernel/` (`DomainService`/`AsyncDomainService`); Repository interfaces de `../repositories/`.

## Forbidden Dependencies

Nenhuma regra que um único Aggregate já resolve sozinho — isso pertence ao próprio Aggregate, nunca a um Domain Service.

## Implementation Status

🚧 Vazio (Missão ENG-0037). `SALES_AGGREGATE_DESIGN.md § 11` identificou apenas uma Policy candidata (transição `Opportunity` → `Contract`/`Revenue`), classificada `Needs Evidence` — não confirmada como Domain Service.

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Nenhum Domain Service é listado em `SALES_TECHNICAL_BLUEPRINT.md` — pasta criada por simetria estrutural com `services/kernel/{identity,organizations,audit}/domain/services/`, não por decisão já tomada.

## Status

🚧 Estrutura criada (Missão ENG-0037). Nenhum código.
