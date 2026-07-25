# sales / domain / events

## Purpose

Local futuro dos Domain Events candidatos de `Sales`: `OpportunityCreated`, `OpportunityWon`, `OpportunityLost`, `ProposalApproved`.

## Responsibilities

Cada evento representa um fato de negócio já ocorrido, disparado exclusivamente pelo Aggregate Root correspondente (`Opportunity`) — nunca por Entity interna diretamente, nunca por camada externa.

## Allowed Dependencies

`packages/shared-kernel/` (`DomainEvent`).

## Forbidden Dependencies

Nenhum payload definido ainda (`SALES_TECHNICAL_BLUEPRINT.md § 7`, `§ 13`); nenhuma dependência de Infrastructure (Event Bus real ainda não implementado, `ADR-0013`).

## Implementation Status

🟡 4 de 4 implementados: `opportunity-created.ts`, `opportunity-won.ts`, `opportunity-lost.ts` (Missão ENG-0039) + `proposal-approved.ts` (Missão ENG-0044 — criado como pré-requisito estrutural de `Opportunity.approveProposal()`; não existia antes, achado registrado no relatório de `ENG-0044`) — todos sem payload de negócio.

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Corresponde a `§ 7 (Candidate Domain Events)` de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md).

## Status

🟢 4 de 4 Domain Events implementados (`ENG-0039`, `ENG-0044`) — corrigido em `ENG-0058`, achado registrado em `SALES_DOMAIN_COMPLETION_AUDIT.md § 8`. Nenhum payload de negócio — pendência de plataforma (`ADR-0019 § Evidence`).
