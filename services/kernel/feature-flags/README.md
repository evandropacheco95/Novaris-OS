# feature-flags

## Objetivo

Controle de funcionalidades habilitadas por organização/plano.

## Fase

Fase C — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md) e o plano de implementação.

## Interface Pública

Ver [CONTRACT.md](CONTRACT.md).

## Dependências

Organizations

## Eventos

Nenhum (`ADR-0038`).

## Status

🟢 Real (`ENG-0140`, [ADR-0038](../../../adr/ADR-0038-configuration-feature-flag-minimum-fields.md)). `FeatureFlag` (Aggregate Root, par chave/booleano por organização) implementado de ponta a ponta (`@novaris/feature-flags`) — Domain/Application/Infrastructure (Prisma real) + `GET/PUT /feature-flags/:key`. Antes marcado "Discovery Required" (`ENG-0007`) — resolvido por `ADR-0038`.
