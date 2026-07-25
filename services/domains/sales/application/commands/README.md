# sales / application / commands

## Purpose

Commands de `Sales`, todos implementados: `CreateOpportunityCommand`, `AdvanceOpportunityStageCommand`, `SubmitProposalCommand`, `ApproveProposalCommand`, `MarkOpportunityWonCommand`, `MarkOpportunityLostCommand`.

## Responsibilities

Cada Command transporta exclusivamente a intenção de mutar o estado de um Aggregate — campos primitivos (`string`), imutáveis (`readonly` + `Object.freeze()`), sem nenhuma regra de negócio própria. Nenhum Command valida, converte para tipo de domínio (`UniqueEntityId`), acessa Repository ou Infrastructure — essas responsabilidades pertencem exclusivamente ao Handler correspondente (`../handlers/`) e ao Aggregate.

## Allowed Dependencies

Nenhuma — cada Command implementado é TypeScript puro, zero import (confirmado por `SALES_APPLICATION_LAYER_READINESS_AUDIT`/`ENG-0071`). Repository interfaces (`domain/repositories/`) e Aggregates (`domain/aggregates/`) são consumidos exclusivamente pelo Handler correspondente, nunca pelo Command.

## Forbidden Dependencies

Nenhuma regra de negócio própria (isso pertence ao Aggregate); nenhuma dependência de `infrastructure/`, `domain/` ou `@novaris/shared-kernel`.

## Implementation Status

🟢 6 de 6 Commands implementados:

| Command | Campos | Missão |
|---|---|---|
| `CreateOpportunityCommand` | `organizationId`, `partyId`, `pipelineId?`, `currentStageId?` | `ENG-0059` |
| `AdvanceOpportunityStageCommand` | `opportunityId`, `stageId` | `ENG-0061` |
| `SubmitProposalCommand` | `opportunityId` | `ENG-0063` |
| `ApproveProposalCommand` | `opportunityId`, `proposalId` | `ENG-0065` |
| `MarkOpportunityWonCommand` | `opportunityId` | `ENG-0067` |
| `MarkOpportunityLostCommand` | `opportunityId` | `ENG-0069` |

Todos os 6 têm Handler correspondente em `../handlers/` (1:1, mesmo nome de pasta). Nenhum Command contém regra de negócio — apenas transportam dados primitivos.

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Corresponde a `§ 6 (Candidate Commands)` de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md).

## Status

🟢 6 de 6 Commands implementados (`ENG-0059`–`ENG-0069`) — corrigido em `ENG-0072`.
