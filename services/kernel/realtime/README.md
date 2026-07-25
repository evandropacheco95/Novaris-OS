# realtime

## Objetivo

Comunicação em tempo real (websockets/subscriptions).

## Fase

Fase E — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md) e o plano de implementação.

## Interface Pública

Ver [CONTRACT.md](CONTRACT.md).

## Dependências

Event Bus

## Eventos

Nenhum — consumidor de `UserCreated` (Event Bus), não origem.

## Status

🟡 Parcial, real (`ENG-0140`, [ADR-0039](../../../adr/ADR-0039-remaining-kernel-infrastructure-adapters.md)). `RealtimeBroadcaster` (Port) definido nesta missão; implementação real (`WebSocketRealtimeGateway`) vive em `apps/api` — ciclo de vida de conexão é acoplado ao framework. Verificado ao vivo com um cliente WebSocket real. Sem "rooms"/filtragem por canal no servidor — broadcast global, cliente filtra.
