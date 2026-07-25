# sales / contracts

## Purpose

Fronteira pública de `Sales` voltada a consumidores externos — API pública e contratos de eventos publicados. Consolida, em forma futura de contrato real, o que [`CONTRACT.md`](../CONTRACT.md) já descreve conceitualmente.

## Responsibilities

Expor `Opportunity`/`Pipeline` (e seus eventos) a outros domínios e camadas (Application/Interface) sem vazar detalhes internos de `domain/`.

## Allowed Dependencies

`domain/` (tipos de retorno, nunca comportamento); `packages/contracts/` (padrão já usado por outros domínios/Kernel).

## Forbidden Dependencies

Nenhuma regra de negócio; nenhuma dependência de `infrastructure/` (contratos não conhecem a tecnologia de persistência).

## Implementation Status

🚧 Estrutura de pastas criada (Missão ENG-0037). Nenhuma API ou payload de evento definido — restrição explícita desta missão.

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Corresponde à camada `Contracts` de `§ 12 (Future Implementation Order)` de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md), posicionada após `Infrastructure`.

## Status

🚧 Estrutura criada (Missão ENG-0037). Nenhum código.
