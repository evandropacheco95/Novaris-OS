# sales / domain

## Purpose

Camada de domínio de `Sales` — onde os Aggregates, Entities, Value Objects, Domain Events, Repository interfaces e Domain Services (se houver) serão definidos.

## Responsibilities

Modelar `Opportunity` e `Pipeline` (Aggregate Roots), suas Entities internas (`Proposal`, `Stage`), Value Objects candidatos (`Revenue`) e os Domain Events que eles disparam — sem nenhuma dependência de infraestrutura, banco de dados ou framework externo.

## Allowed Dependencies

`packages/shared-kernel/` (`AggregateRoot`, `Entity`, `ValueObject`, `Result`, `DomainEvent`) — nenhuma outra dependência externa é permitida na camada de domínio ("Shared Kernel First", `ARCHITECTURE_GOVERNANCE.md § 2`).

## Forbidden Dependencies

`application/`, `infrastructure/`, `contracts/` — a camada de domínio nunca depende de camadas externas a si mesma (Clean Architecture, dependência sempre para dentro). Nenhum ORM, driver de banco, framework HTTP ou SDK externo.

## Implementation Status

🟡 `Opportunity`/`Pipeline` (Aggregate Roots) e `Proposal`/`Stage` (Internal Entities) implementados e testados (`ENG-0039`–`ENG-0056`); 4 Domain Events implementados (`domain/events/`). `Revenue` (Value Object) e qualquer Domain Service permanecem não implementados — bloqueados por ausência de decisão de domínio (`SALES_AGGREGATE_DESIGN.md § 13`), não por falta de aprovação.

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Corresponde à seção `§ 3 (Aggregate Structure)` e `§ 4 (Folder Structure)` de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md).

## Status

🟡 2 Aggregate Roots + 2 Internal Entities + 4 Domain Events implementados e testados (`ENG-0039`–`ENG-0056`) — corrigido em `ENG-0058`, achado registrado em `SALES_DOMAIN_COMPLETION_AUDIT.md § 8`. `Value Objects`/`Domain Services` permanecem vazios (bloqueados por ausência de decisão).
