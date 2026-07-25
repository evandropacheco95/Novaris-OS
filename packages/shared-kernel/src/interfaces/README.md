# interfaces

## Objetivo

Interfaces/ports compartilhados entre múltiplos blocos de `core/` que não são especificamente Repository (ex.: portas de serviço externo genéricas), e — desde a Missão ENG-0001.9 — contratos estruturais compartilhados por Entities/Aggregates (identidade, auditoria, versionamento, metadados, timestamps).

## Conteúdo (Missão ENG-0001.9 — Core Domain Contracts)

- [has-identity.ts](has-identity.ts) — `HasIdentity`: `readonly id: UniqueEntityId`. `Entity`/`AggregateRoot` já satisfazem isto estruturalmente via seu getter `id` — nenhuma alteração nelas foi necessária.
- [timestamped.ts](timestamped.ts) — `Timestamped`: `readonly createdAt: Date`, `readonly updatedAt: Date`.
- [versionable.ts](versionable.ts) — `Versionable`: `readonly version: number`.
- [has-metadata.ts](has-metadata.ts) — `HasMetadata<T extends Record<string, unknown> = Record<string, unknown>>`: `readonly metadata: T`.
- [auditable.ts](auditable.ts) — `Auditable extends Timestamped`: adiciona `readonly createdBy: UniqueEntityId`, `readonly updatedBy: UniqueEntityId` — herança real entre contratos, não composição manual dos mesmos campos.

Todas as 5 são interfaces puras (nenhum comportamento, só propriedades `readonly`) — servem para uma futura Entity/Aggregate concreto (ex.: `Organization`) declarar `implements Auditable, Versionable, HasMetadata<...>` conforme a necessidade, sem qualquer alteração no Shared Kernel.

## Status

🟢 5 contratos implementados e testados (Missão ENG-0001.9). Nenhuma Entity/Value Object/Aggregate concreto implementado.
