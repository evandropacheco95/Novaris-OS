import "reflect-metadata";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import { NestFactory } from "@nestjs/core";
import { WsAdapter } from "@nestjs/platform-ws";
import { ConsoleLogger } from "@novaris/logging";
import { eventBus } from "@novaris/event-bus";
import { ConsoleNotifier } from "@novaris/notifications";
import { AppModule } from "./app.module.js";
import { NestLoggerAdapter } from "./logging/nest-logger.adapter.js";
import { RealtimeGateway } from "./realtime/realtime.gateway.js";

/**
 * Carrega `apps/api/.env` (hoje só `JWT_SECRET`) por caminho absoluto — mesmo
 * padrão já usado por `@novaris/database` (`packages/database/src/index.ts`),
 * independente do `cwd` de quem inicia o processo. Distinto do `.env` de
 * `packages/database` (`DATABASE_URL`/`DIRECT_URL`) — `JWT_SECRET` é
 * exclusivamente desta API (assinatura/verificação de token), nunca usado por
 * nenhum Repository.
 */
const envPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".env");
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

/**
 * Subscriber de prova do Event Bus real (`ADR-0037`, `ENG-0139`) — loga todo
 * `UserCreated` publicado por `CreateUserHandler`. Vive aqui, não dentro de
 * `@novaris/event-bus`/`@novaris/logging` — os dois pacotes de Kernel
 * permanecem sem dependência um do outro; é a composition root (`apps/api`)
 * quem os conecta.
 */
function registerEventLoggingSubscriber(logger: ConsoleLogger): void {
  eventBus.subscribe("UserCreated", (event) => {
    logger.info(`Domain event recebido: ${event.eventName}`, {
      eventId: event.eventId,
      aggregateId: event.aggregateId.toValue(),
    });
  });
}

/**
 * Segunda integração real do Event Bus (`ADR-0039`, `ENG-0140`) — mesma
 * composição: `apps/api` liga `@novaris/notifications` a `UserCreated` sem
 * que nenhum dos dois pacotes de Kernel dependa do outro diretamente.
 */
function registerWelcomeNotificationSubscriber(notifier: ConsoleNotifier): void {
  eventBus.subscribe("UserCreated", (event) => {
    notifier.notify(event.aggregateId.toValue(), "Bem-vindo à NOVARIS", { eventId: event.eventId });
  });
}

/**
 * Terceira integração real do Event Bus (`ADR-0039`, `ENG-0140`) — rebroadcast
 * de `UserCreated` para todo cliente WebSocket conectado. `RealtimeGateway`
 * precisa vir da instância gerenciada pelo Nest (`app.get`) — só assim
 * `@WebSocketServer()` é injetado pelo framework antes do primeiro uso.
 */
function registerRealtimeBroadcastSubscriber(gateway: RealtimeGateway): void {
  eventBus.subscribe("UserCreated", (event) => {
    gateway.broadcast("UserCreated", { eventId: event.eventId, aggregateId: event.aggregateId.toValue() });
  });
}

async function bootstrap(): Promise<void> {
  const logger = new ConsoleLogger();
  const app = await NestFactory.create(AppModule, { logger: new NestLoggerAdapter(logger) });
  // CORS habilitado para o Frontend (`apps/web`, porta própria) chamar esta
  // API a partir do navegador — sem isso, todo `fetch()` do lado do cliente
  // falharia por política de mesma origem (`ENG-0123`, Frontend Web #1).
  // `exposedHeaders` inclui `Content-Disposition` — sem isso, o navegador não
  // deixa JS ler esse header em resposta cross-origin (Vercel↔Railway,
  // `ADR-0046`), quebrando a leitura do filename real em `downloadFile()`
  // (`ADR-0048`).
  app.enableCors({ exposedHeaders: ["Content-Disposition"] });
  // `ws` puro, não `socket.io` (padrão do NestJS) — `RealtimeGateway`
  // (`ADR-0039`) não precisa de "rooms", `ws` já basta.
  app.useWebSocketAdapter(new WsAdapter(app));
  registerEventLoggingSubscriber(logger);
  registerWelcomeNotificationSubscriber(new ConsoleNotifier(logger));
  registerRealtimeBroadcastSubscriber(app.get(RealtimeGateway));
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
  logger.info(`NOVARIS API rodando em http://localhost:${port}`);
}

void bootstrap();
