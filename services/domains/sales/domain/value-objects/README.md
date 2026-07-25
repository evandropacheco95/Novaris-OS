# sales / domain / value-objects

## Purpose

Local futuro dos Value Objects de `Sales`: `Revenue` (candidato a Value Object monetário).

## Responsibilities

Objetos imutáveis, sem identidade própria, comparados por valor — mesmo padrão de `ValueObject<T>` do Shared Kernel.

## Allowed Dependencies

`packages/shared-kernel/` (`ValueObject`).

## Forbidden Dependencies

Qualquer identidade própria (`UniqueEntityId`); Repository, Infrastructure, Application Layer.

## Implementation Status

🚧 Vazio (Missão ENG-0037). `Revenue` permanece candidato — forma de campos (moeda, precisão) não definida (`SALES_TECHNICAL_BLUEPRINT.md § 13`).

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Corresponde a `§ 3 (Aggregate Structure — Value Objects)` de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md).

## Status

🚧 Estrutura criada (Missão ENG-0037). Nenhum código.
