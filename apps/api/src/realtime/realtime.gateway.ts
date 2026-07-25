import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { RealtimeBroadcaster } from "@novaris/realtime";

/**
 * WebSocketRealtimeGateway — adapter real do Port `RealtimeBroadcaster`
 * (`ADR-0039`, `ENG-0140`). `@nestjs/platform-ws` (não `socket.io`) —
 * mecanismo mais simples suficiente para broadcast global, sem exigir a
 * biblioteca mais pesada quando "rooms" não são usadas (ver
 * `CONTRACT.md § Status`, "sem rooms/filtragem no servidor").
 *
 * `server` é o `ws.Server` cru — `server.clients` é um `Set<WebSocket>`
 * nativo da biblioteca `ws`, iterado diretamente aqui.
 */
@WebSocketGateway()
export class RealtimeGateway implements RealtimeBroadcaster {
  @WebSocketServer()
  server!: { clients: Set<{ readyState: number; send(data: string): void }> };

  broadcast(channel: string, payload: unknown): void {
    const message = JSON.stringify({ channel, payload });
    for (const client of this.server.clients) {
      if (client.readyState === 1 /* WebSocket.OPEN */) {
        client.send(message);
      }
    }
  }
}
