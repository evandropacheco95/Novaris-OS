# sales / infrastructure / persistence

## Purpose

Formas conceituais de registro persistido (`Record`) de `Sales` — `OpportunityRecord`/`ProposalRecord`/`PipelineRecord`/`StageRecord`. Nenhum schema de banco real — apenas interfaces TypeScript.

## Responsibilities

Definir a forma plana de cada Aggregate/Entity interna para uso pelos Mappers (`../mappers/`) e Repositories (`../repositories/`) — nenhuma lógica, nenhuma tradução acontece aqui.

## Allowed Dependencies

`domain/` (tipos `OpportunityStatus`/`ProposalStatus`, só para tipagem — nunca comportamento).

## Forbidden Dependencies

Qualquer regra de negócio; qualquer dependência de `application/`; qualquer tecnologia de banco/ORM real.

## Implementation Status

🟡 2 Records implementados (Missão ENG-0050): `opportunity-record.ts` (`OpportunityRecord`/`ProposalRecord`), `pipeline-record.ts` (`PipelineRecord`/`StageRecord`) — campos idênticos aos já implementados nos Aggregates/Entities reais (`SALES_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 4-7`), nenhum campo inventado.

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Não coberto explicitamente por [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md) — Persistence Design é uma Fase distinta (Fase 3), ainda não executada para `Sales`.

## Status

🟡 2 arquivos implementados (Missão ENG-0050). Apenas tipos — nenhum schema, migration ou banco real.
