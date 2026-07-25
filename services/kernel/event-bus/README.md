# event-bus

## Objetivo

Publicação e assinatura de eventos de domínio.

## Fase

Fase A — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md) e o plano de implementação.

## Interface Pública

Ver [CONTRACT.md](CONTRACT.md).

## Dependências

Nenhuma.

## Eventos

Transporta os eventos já nomeados em outros domínios (`UserCreated`, `OrganizationCreated` etc.) — não é a origem deles. Ver [CONTRACT.md § Eventos Emitidos](CONTRACT.md).

## Status

🟢 Real (`ENG-0139`, [ADR-0037](../../../adr/ADR-0037-event-bus-mechanism.md)). `EventBus` (Port) + `InProcessEventBus` (Infrastructure) implementados e testados (`@novaris/event-bus`), mecanismo in-process síncrono — sem broker externo, sem dependência de `@novaris/logging` (mantém `logging`/`event-bus` não-dependentes entre si, `IMPLEMENTATION_ROADMAP.md § 7`). Primeira integração real: `CreateUserHandler` (Identity) publica `UserCreated` após `save()`; um Subscriber de prova em `apps/api/src/main.ts` consome e loga via `@novaris/logging`. Retrofit dos demais 28 Handlers já implementados nos outros domínios explicitamente adiado — decisão futura, não tomada nesta missão.
