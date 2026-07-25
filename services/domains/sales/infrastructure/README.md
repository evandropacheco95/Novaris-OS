# sales / infrastructure

## Purpose

Camada de infraestrutura de `Sales` — implementações concretas de Repository, Mapper e persistência. Última camada a ser implementada, por princípio ("No Infrastructure Before Domain", `ARCHITECTURE_GOVERNANCE.md § 2`).

## Responsibilities

Implementar as interfaces de Repository definidas em `domain/repositories/`, traduzindo Aggregates para o modelo de persistência real — só depois de uma Persistence & Mapper Blueprint dedicada (Fase 3 de `KERNEL_DOMAIN_LIFECYCLE_V2.md`), ainda não executada para `Sales`.

## Allowed Dependencies

`domain/` (interfaces de Repository, Aggregates); ORM/driver de banco (só quando a Persistence & Mapper Blueprint definir a tecnologia).

## Forbidden Dependencies

Nenhuma regra de negócio (pertence a `domain/`); nenhuma dependência de `application/` (a direção de dependência é sempre de fora para dentro).

## Implementation Status

🟡 Implementação inicial concluída (Missão ENG-0050): `persistence/` (`OpportunityRecord`/`ProposalRecord`/`PipelineRecord`/`StageRecord`), `mappers/` (`OpportunityMapper`/`PipelineMapper`), `repositories/` (`InMemoryOpportunityRepository`/`InMemoryPipelineRepository` — armazenamento em memória, sem banco/ORM/schema real). `Proposal`/`Stage` seguem persistidos exclusivamente como parte da agregação de `Opportunity`/`Pipeline` — nenhum Repository próprio para nenhum dos dois. `InMemoryOpportunityRepository`/`InMemoryPipelineRepository` têm cobertura de teste de contrato (14 testes, Missão ENG-0052) — ver [tests/domain/repositories/README.md](../tests/domain/repositories/README.md).

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Corresponde à camada `Infrastructure` de `§ 12 (Future Implementation Order)` de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md), posicionada após `Application`.

## Status

🟡 6 arquivos implementados (Missão ENG-0050). Sem banco, ORM, schema, migration ou API real.
