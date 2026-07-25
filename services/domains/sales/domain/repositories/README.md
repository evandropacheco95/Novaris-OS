# sales / domain / repositories

## Purpose

Local futuro das interfaces conceituais de Repository de `Sales`: `OpportunityRepository`, `PipelineRepository`.

## Responsibilities

Definir o contrato de persistência de cada Aggregate Root, sem nenhum método de conveniência além do já provido por `Repository<T>`/`ReadRepository<T>`/`WriteRepository<T>` do Shared Kernel — mesmo padrão de zero método próprio já usado por `Identity`/`Organization`/`Audit`.

## Allowed Dependencies

`packages/shared-kernel/` (`Repository`, `ReadRepository`, `WriteRepository`); os próprios Aggregates de `../aggregates/`.

## Forbidden Dependencies

Qualquer implementação concreta (ORM, driver de banco) — isso pertence a `infrastructure/repositories/`, nunca aqui.

## Implementation Status

🟡 2 interfaces implementadas (Missão ENG-0045): `opportunity-repository.ts` (`OpportunityRepository extends ReadRepository<Opportunity>, WriteRepository<Opportunity>`), `pipeline-repository.ts` (`PipelineRepository extends ReadRepository<Pipeline>, WriteRepository<Pipeline>`) — zero método próprio, mesmo padrão de `OrganizationRepository`/`UserRepository`/`RoleRepository`. Nenhuma implementação concreta (isso é `infrastructure/repositories/`). Sem Repository para `Proposal`/`Stage` (Internal Entities, nunca têm Repository próprio). Ambos os contratos têm cobertura de teste (14 testes, Missão ENG-0052) — ver [tests/domain/repositories/README.md](../../tests/domain/repositories/README.md).

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Corresponde a `§ 5 (Repository Interfaces)` de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md).

## Status

🟢 2 interfaces de Repository implementadas e cobertas por 14 testes de contrato (`ENG-0045`, `ENG-0052`) — corrigido em `ENG-0058`, achado registrado em `SALES_DOMAIN_COMPLETION_AUDIT.md § 8`.
