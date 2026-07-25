# logging

## Objetivo

Logs estruturados de toda a plataforma.

## Fase

Fase A — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md) e o plano de implementação.

## Interface Pública

Ver [CONTRACT.md](CONTRACT.md).

## Dependências

Nenhuma.

## Eventos

Não aplicável — `logging` é consumidor final (sink), não origem de eventos de domínio.

## Status

🟢 Real (`ENG-0139`, [ADR-0037](../../../adr/ADR-0037-event-bus-mechanism.md)). `Logger` (Port) + `ConsoleLogger` (Infrastructure) implementados e testados (`@novaris/logging`); ligado ao bootstrap real de `apps/api` via `NestLoggerAdapter`, substituindo o `console.log` avulso que existia em `main.ts`. Biblioteca externa (pino/winston) permanece decisão futura — `ConsoleLogger` já cobre o caso de uso real (JSON estruturado em `stdout`).
