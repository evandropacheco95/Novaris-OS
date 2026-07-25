import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { RealtimeBroadcaster } from "../../src/domain/ports/realtime-broadcaster.js";

/**
 * `RealtimeBroadcaster` não tem Infrastructure própria neste pacote (o
 * adapter real, `WebSocketRealtimeGateway`, vive em `apps/api` — depende do
 * ciclo de vida de conexão do NestJS/`ws`, framework-specific). Este teste só
 * prova que a forma do Port é implementável e usável, mesmo padrão de
 * `OrganizationRepository — existência e importabilidade do contrato`.
 */
describe("RealtimeBroadcaster — existência e forma do contrato", () => {
  it("é implementável por uma classe simples", () => {
    class FakeBroadcaster implements RealtimeBroadcaster {
      readonly sent: Array<{ channel: string; payload: unknown }> = [];
      broadcast(channel: string, payload: unknown): void {
        this.sent.push({ channel, payload });
      }
    }

    const broadcaster = new FakeBroadcaster();
    broadcaster.broadcast("UserCreated", { eventId: "abc" });

    assert.equal(broadcaster.sent.length, 1);
    assert.equal(broadcaster.sent[0]!.channel, "UserCreated");
  });
});
