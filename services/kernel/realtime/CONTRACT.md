# Contrato de Serviço — realtime

## Objetivo

Comunicação em tempo real (websockets/subscriptions). Implementado real em `ENG-0140`/`ADR-0039`.

## Interface Pública

```typescript
interface RealtimeBroadcaster {
  broadcast(channel: string, payload: unknown): void;
}
```

## Entradas/Saídas

| Função | Entrada | Saída | Observação |
|---|---|---|---|
| `broadcast` | `channel: string`, `payload: unknown` | `void` | Adapter real (`WebSocketRealtimeGateway`, `apps/api`) envia `{ channel, payload }` a **todo** cliente conectado — sem "rooms"/filtragem no servidor |

## Erros

Não aplicável a este Port — o adapter real decide como tratar falha de socket individual (cliente desconectado durante o envio), fora do escopo deste contrato.

## Eventos Emitidos

Nenhum — este módulo é transporte/consumidor, não origem.

## Dependências

Event Bus.

## Object Specification

Não aplicável — infraestrutura transversal, não expõe um Business Object do BOM.

## Status

🟡 Parcial, real (`ENG-0140`, `ADR-0039`). `RealtimeBroadcaster` (Port) definido e testado estruturalmente. **Implementação real vive em `apps/api`** (`WebSocketRealtimeGateway`, `@nestjs/websockets` + `@nestjs/platform-ws`, sem `socket.io`) — não neste pacote, porque o ciclo de vida de conexão WebSocket é inerentemente acoplado ao framework. Primeira integração real: subscriber de `UserCreated` (Event Bus) rebroadcastado a todo cliente WebSocket conectado — verificado ao vivo com um cliente `ws` real. Sem "rooms"/assinatura seletiva no servidor — escopo mínimo deliberado.
