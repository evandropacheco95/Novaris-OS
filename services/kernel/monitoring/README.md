# monitoring

## Objetivo

Métricas, health checks e observabilidade da plataforma.

## Fase

Fase G — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md) e o plano de implementação.

## Interface Pública

Ver [CONTRACT.md](CONTRACT.md).

## Dependências

Database, Logging (corrigido em `ENG-0140` — ver [CONTRACT.md § Dependências](CONTRACT.md)). `Event Bus`, citado originalmente, permanece aspiracional.

## Eventos

Nenhum.

## Status

🟡 Parcial, real (`ENG-0140`, [ADR-0039](../../../adr/ADR-0039-remaining-kernel-infrastructure-adapters.md)). `HealthCheck` (Port) + `DatabaseHealthCheck` (Infrastructure) implementados e testados (`@novaris/monitoring`), expostos via `GET /health` real em `apps/api`. Escopo restrito a conectividade com Postgres — métricas/observabilidade completas ficam para uma missão futura.
