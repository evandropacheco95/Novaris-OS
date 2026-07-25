# sales / domain / aggregates

## Purpose

Local futuro dos dois Aggregate Roots de `Sales`: `Opportunity` (transacional) e `Pipeline` (Configuration Aggregate).

## Responsibilities

Cada Aggregate Root garante suas próprias invariantes, expõe `create()`/`reconstitute()`, e é o único ponto de mutação de si mesmo e de suas Entities internas — mesmo padrão de `AGGREGATE_IMPLEMENTATION_STANDARD.md` (ENS-0001) já usado por `Identity`/`Organization`/`Audit`.

## Allowed Dependencies

`packages/shared-kernel/` (`AggregateRoot`, `Result`, `DomainError`); Value Objects e Entities internos do próprio Aggregate (`../value-objects/`, `../entities/`); referências por id a outros domínios (nunca objeto embutido).

## Forbidden Dependencies

Qualquer Repository, Mapper, Infrastructure ou Application Layer; qualquer Aggregate de outro domínio (sempre por id).

## Implementation Status

🟡 `Opportunity` implementado (Missão ENG-0039) — `opportunity/opportunity.ts`, seguindo `AGGREGATE_IMPLEMENTATION_STANDARD.md` (ENS-0001) via `Result<T, DomainError>`, nunca exceção (desvio registrado da Ordem de Missão, ver comentário no próprio arquivo). `Pipeline` implementado (Missão ENG-0041) — `pipeline/pipeline.ts`, Configuration Aggregate (`ADR-0021`). **Wiring `Pipeline`↔`Stage` implementado (Missão ENG-0043)**: `Pipeline` possui coleção interna `stages: Stage[]` (campo de classe, fora de `PipelineProps`), com `addStage()`/`findStage()`/`getStages()` (cópia defensiva) — sem `reorderStage`/`removeStage`/`activateStage`/`deactivateStage` (nenhuma ADR sustenta essas regras) e sem `PipelineCreated`/nenhum Domain Event novo. **Wiring `Opportunity`↔`Proposal` implementado (Missão ENG-0044)**: `Opportunity` possui coleção interna `proposals: Proposal[]`, com `addProposal()`/`findProposal()`/`getProposals()` (cópia defensiva) e `approveProposal(proposalId)` — localiza a `Proposal`, delega a `proposal.approve()`, e é a própria `Opportunity` (Aggregate Root) quem dispara `ProposalApproved` (`Proposal` nunca publica evento diretamente). **`submitProposal(input)` implementado (Missão ENG-0049)** — Option B de `SALES_SUBMIT_PROPOSAL_DESIGN.md` (ENG-0048): cria e adiciona uma `Proposal` numa única operação atômica, reutilizando `Proposal.create()` + `addProposal()`; `addProposal()` mantido, reservado para reconstituição via Mapper. Sem `rejectProposal`/`cancelProposal`/`removeProposal`/`editProposal` (nenhuma ADR sustenta essas regras). Nenhum dos dois Aggregates tem Repository concreto (contratos definidos em `ENG-0045`). `Opportunity` tem cobertura de teste unitário (24 testes, Missão ENG-0053) — ver [tests/domain/aggregates/opportunity/README.md](../../tests/domain/aggregates/opportunity/README.md). `Pipeline` (e `Stage`, sua Entity interna) tem cobertura de teste unitário (21 testes, Missão ENG-0054) — ver [tests/domain/aggregates/pipeline/README.md](../../tests/domain/aggregates/pipeline/README.md).

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Corresponde a `§ 3 (Aggregate Structure — Aggregate Roots)` de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md).

## Status

🟢 `Opportunity`/`Pipeline` implementados, conectados a suas Internal Entities, e cobertos por 45 testes unitários (`ENG-0039`–`ENG-0054`) — corrigido em `ENG-0058`, achado registrado em `SALES_DOMAIN_COMPLETION_AUDIT.md § 8`.
