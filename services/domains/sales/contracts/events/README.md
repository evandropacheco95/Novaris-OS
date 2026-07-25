# sales / contracts / events

## Purpose

Local futuro dos contratos publicados dos Domain Events de `Sales` (`OpportunityCreated`, `OpportunityWon`, `OpportunityLost`, `ProposalApproved`) — sem payload definido, por restrição explícita da Missão ENG-0037.

## Responsibilities

Formalizar, quando payloads existirem, o contrato externo de cada evento — distinto do `DomainEvent` interno de `domain/events/`, que é o fato de negócio em si.

## Allowed Dependencies

`domain/events/` (nomes já candidatos); `packages/shared-kernel/` (`DomainEvent`, quando o payload for definido).

## Forbidden Dependencies

Qualquer regra de negócio; qualquer definição de payload nesta missão.

## Implementation Status

🚧 Vazio (Missão ENG-0037). Nomes candidatos apenas — payload é pendência de plataforma já registrada (`ADR-0019`), não específica de `Sales`.

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Corresponde a `§ 7 (Candidate Domain Events)` de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md), sem payload, conforme lá já registrado.

## Status

🚧 Estrutura criada (Missão ENG-0037). Nenhum código.
