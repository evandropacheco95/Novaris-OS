# sales / infrastructure / repositories

## Purpose

Local futuro das implementações concretas de `OpportunityRepository` e `PipelineRepository`, cujas interfaces vivem em `domain/repositories/`.

## Responsibilities

Implementar as interfaces de `domain/repositories/` usando a tecnologia de persistência que vier a ser definida — sem adicionar nenhum método de conveniência além do já contratado pela interface.

## Allowed Dependencies

`domain/repositories/` (interfaces a implementar); `../persistence/` (Mappers); tecnologia de persistência (a definir).

## Forbidden Dependencies

Qualquer método além do já definido na interface de `domain/repositories/`; qualquer regra de negócio.

## Implementation Status

🟡 2 implementações concretas (Missão ENG-0050): `in-memory-opportunity-repository.ts`, `in-memory-pipeline-repository.ts` — armazenamento em memória (`Map`), sem banco/ORM/schema real, usando `../mappers/` para toda tradução. Implementam exclusivamente os 5 métodos já congelados de `domain/repositories/` (`findById`, `findAll`, `exists`, `save`, `delete`) — nenhum método de conveniência.

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Corresponde à implementação concreta de `§ 5 (Repository Interfaces)` de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md).

## Status

🟡 2 arquivos implementados (Missão ENG-0050). Sem banco/ORM/schema real.
