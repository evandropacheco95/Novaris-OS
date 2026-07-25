# sales / application / queries

## Purpose

Local futuro das Queries de `Sales` (ex.: buscar `Opportunity` por id, listar `Opportunity`s por `Stage`) — nenhuma nomeada ainda por nenhuma fonte oficial.

## Responsibilities

Ler estado de Aggregates via Repository (`ReadRepository`), sem mutar nada.

## Allowed Dependencies

`ReadRepository` interfaces de `domain/repositories/`.

## Forbidden Dependencies

Qualquer mutação de Aggregate; qualquer dependência de `infrastructure/` direta.

## Implementation Status

🚧 Vazio (Missão ENG-0037). Nenhuma Query nomeada por `SALES_TECHNICAL_BLUEPRINT.md` ou qualquer Discovery anterior — pasta criada por simetria estrutural, não por decisão já tomada.

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Não nomeada explicitamente em nenhuma seção de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md) — pasta prevista pela Ordem de Missão `ENG-0037`, consistente com `§ 4 (Folder Structure)`.

## Status

🚧 Estrutura criada (Missão ENG-0037). Nenhum código.
