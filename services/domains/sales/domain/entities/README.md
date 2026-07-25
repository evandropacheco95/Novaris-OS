# sales / domain / entities

## Purpose

Local futuro das Entities internas dos Aggregates de `Sales`: `Proposal` (interna a `Opportunity`, candidata) e `Stage` (interna a `Pipeline`, confirmada por `ADR-0021`).

## Responsibilities

Cada Entity tem identidade própria dentro da fronteira do seu Aggregate, mas nunca é acessada ou mutada diretamente de fora dele — só através do Aggregate Root correspondente.

## Allowed Dependencies

`packages/shared-kernel/` (`Entity`); Value Objects do mesmo Aggregate.

## Forbidden Dependencies

Qualquer acesso direto de fora do Aggregate Root que a possui; Repository, Infrastructure, Application Layer.

## Implementation Status

🟡 `Proposal` implementado (Missão ENG-0040) — `proposal/proposal.ts`, estende `Entity<T>` (não `AggregateRoot<T>`), nunca publica evento diretamente. `Stage` implementado (Missão ENG-0042) — `stage/stage.ts`, Internal Entity de `Pipeline` (`ADR-0021`), estado mínimo (`name`), sem métodos de mutação. Nenhuma das duas Entities está conectada ao seu Aggregate possuidor ainda (wiring é trabalho futuro). `Proposal` tem cobertura de teste unitário isolada (16 testes, Missão ENG-0055) — ver [tests/domain/entities/proposal/README.md](../../tests/domain/entities/proposal/README.md). `Stage` tem cobertura de teste unitário isolada (14 testes, Missão ENG-0056) — ver [tests/domain/entities/stage/README.md](../../tests/domain/entities/stage/README.md), além da cobertura indireta já existente via [tests/domain/aggregates/pipeline/README.md](../../tests/domain/aggregates/pipeline/README.md) (Missão ENG-0054).

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Corresponde a `§ 3 (Aggregate Structure — Internal Entities)` de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md).

## Status

🟢 `Proposal`/`Stage` implementados, conectados ao seu Aggregate possuidor, e cobertos por 30 testes unitários isolados (`ENG-0040`–`ENG-0056`) — corrigido em `ENG-0058`, achado registrado em `SALES_DOMAIN_COMPLETION_AUDIT.md § 8`.
