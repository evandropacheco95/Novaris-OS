# sales / infrastructure / mappers

## Purpose

Tradução pura Aggregate ↔ Persistência (`../persistence/`) — `OpportunityMapper`/`PipelineMapper`, sem I/O, sem regra de negócio.

## Responsibilities

`toPersistence()`: converter um Aggregate real (`Opportunity`/`Pipeline`) num `Record` plano (`../persistence/`). `toDomain()`: reconstruir o Aggregate a partir de um `Record`, via `reconstitute()` — sem validação, sem Domain Events (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 8`, ENS-0001).

## Allowed Dependencies

`domain/` (Aggregates/Entities reais, para leitura de forma); `../persistence/` (tipos `Record`); `@novaris/shared-kernel` (`UniqueEntityId`).

## Forbidden Dependencies

Qualquer regra de negócio; qualquer disparo de Domain Event; qualquer I/O direto (persistir/consultar é responsabilidade de `../repositories/`); qualquer tipo de tecnologia (Prisma/SQL) na assinatura pública.

## Implementation Status

🟡 2 Mappers implementados (Missão ENG-0050): `opportunity-mapper.ts`, `pipeline-mapper.ts` — cada um com `toPersistence()`/`toDomain()` exclusivamente, seguindo `SALES_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 10-11`.

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Não coberto explicitamente por [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md) — Mapper é detalhado em [`SALES_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 10-11`](../../../../../knowledge/architecture/blueprints/SALES_PERSISTENCE_MAPPING_BLUEPRINT.md) (Fase 3).

## Status

🟡 2 arquivos implementados (Missão ENG-0050). Sem tecnologia de persistência real.
