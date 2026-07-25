# sales / contracts / api

## Purpose

Local futuro da definição de API pública de `Sales` (endpoints, DTOs) — nenhuma API definida ainda, por restrição explícita da Missão ENG-0037.

## Responsibilities

Expor operações sobre `Opportunity`/`Pipeline` a consumidores externos (Application Layer de outros domínios, Interface Layer) — sem payload ou definição de endpoint ainda.

## Allowed Dependencies

`domain/` (tipos, nunca comportamento); `../events/` (para correlacionar API com eventos, se aplicável).

## Forbidden Dependencies

Qualquer implementação de `infrastructure/`; qualquer regra de negócio.

## Implementation Status

🚧 Vazio (Missão ENG-0037). Nenhuma API definida — restrição explícita desta missão ("No API definitions").

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Não coberto por nenhuma seção de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md) — API real é trabalho de uma futura missão de implementação, fora do escopo de Blueprint e desta Skeleton.

## Status

🚧 Estrutura criada (Missão ENG-0037). Nenhum código.
