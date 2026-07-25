# search

## Objetivo

Indexação e busca sobre objetos da plataforma.

## Fase

Fase G — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md) e o plano de implementação.

## Interface Pública

Ver [CONTRACT.md](CONTRACT.md).

## Dependências

Database (corrigido em `ENG-0140` — ver [CONTRACT.md § Dependências](CONTRACT.md)). `Event Bus`, citado originalmente, permanece decisão futura (indexação reativa).

## Eventos

Nenhum.

## Status

🟡 Parcial, real (`ENG-0140`, [ADR-0039](../../../adr/ADR-0039-remaining-kernel-infrastructure-adapters.md)). `SearchIndex` (Port) + `PostgresPartySearch` (Infrastructure) implementados e testados (`@novaris/search`), exposto via `GET /parties/search?q=`. Escopo restrito a `Party` — outras entidades ficam para uma missão futura.
