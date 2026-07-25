# sales / application / handlers

## Purpose

Handlers que processam os Commands de `../commands/`, todos implementados. Nenhum handler de Query existe ainda — `../queries/` permanece vazio.

## Responsibilities

Cada Handler segue o mesmo padrão: recebe um Command, resolve o Aggregate via Repository (`findById()`, quando aplicável), delega o comportamento inteiramente ao Domain Layer (exatamente um método público do Aggregate), persiste via Repository interface (`save()`) — sem decidir regra de negócio própria. Nenhum Handler publica Domain Event diretamente — isso é responsabilidade exclusiva do próprio Aggregate (ex.: `Opportunity.markWon()` já dispara `OpportunityWon` internamente via `addDomainEvent()`).

## Allowed Dependencies

`domain/aggregates/`, `domain/repositories/` (interfaces); `../commands/` (tipo, para tipar o parâmetro de `execute()`); `@novaris/shared-kernel` (`Result`, `UniqueEntityId`, `NotFoundError`, `DomainError`).

## Forbidden Dependencies

Qualquer regra de negócio (pertence ao Aggregate); qualquer dependência direta de `infrastructure/` (só via interface).

## Implementation Status

🟢 6 de 6 Handlers implementados:

| Handler | Command consumido | Método do Aggregate | Retorno | Missão |
|---|---|---|---|---|
| `CreateOpportunityHandler` | `CreateOpportunityCommand` | `Opportunity.create()` | `Result<Opportunity, DomainError>` | `ENG-0060` |
| `AdvanceOpportunityStageHandler` | `AdvanceOpportunityStageCommand` | `Opportunity.advanceStage()` | `Result<Opportunity, DomainError>` | `ENG-0062` |
| `SubmitProposalHandler` | `SubmitProposalCommand` | `Opportunity.submitProposal()` | `Result<Proposal, DomainError>` | `ENG-0064` |
| `ApproveProposalHandler` | `ApproveProposalCommand` | `Opportunity.approveProposal()` | `Result<Proposal, DomainError>` | `ENG-0066` |
| `MarkOpportunityWonHandler` | `MarkOpportunityWonCommand` | `Opportunity.markWon()` | `Result<Opportunity, DomainError>` | `ENG-0068` |
| `MarkOpportunityLostHandler` | `MarkOpportunityLostCommand` | `Opportunity.markLost()` | `Result<Opportunity, DomainError>` | `ENG-0070` |

Todos os 6 seguem forma idêntica: dependência única (`OpportunityRepository`) injetada via construtor, conversão `string` → `UniqueEntityId` como única lógica própria, `NotFoundError` reutilizado quando o Aggregate não é encontrado, falha do Aggregate propagada sem adaptação. Auditados e classificados `APPLICATION VERIFIED WITH CONDITIONS` (`ENG-0071`).

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Corresponde à camada `Application` de `§ 12 (Future Implementation Order)` de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md).

## Status

🟢 6 de 6 Handlers implementados (`ENG-0060`–`ENG-0070`) — corrigido em `ENG-0072`.
