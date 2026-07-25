import { Module } from "@nestjs/common";
import { RealtimeGateway } from "./realtime.gateway.js";

/**
 * RealtimeModule — Composition Root de `realtime` (`ADR-0039`, `ENG-0140`).
 * Exporta `RealtimeGateway` para que `main.ts` possa registrar o subscriber
 * de `UserCreated` no bootstrap (mesmo padrão de `logging`/`notifications`).
 */
@Module({
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
