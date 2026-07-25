# scheduler

## Objetivo

Agendamento de execuções futuras/recorrentes.

## Fase

Fase F — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md) e o plano de implementação.

## Interface Pública

Ver [CONTRACT.md](CONTRACT.md).

## Dependências

Logging

## Eventos

Nenhum.

## Status

🟢 Real (`ENG-0140`, [ADR-0039](../../../adr/ADR-0039-remaining-kernel-infrastructure-adapters.md)). `Scheduler` (Port) + `InProcessScheduler` (Infrastructure) implementados e testados (`@novaris/scheduler`) — sem persistência, sem consumidor real ainda (capacidade pronta para uso futuro).
