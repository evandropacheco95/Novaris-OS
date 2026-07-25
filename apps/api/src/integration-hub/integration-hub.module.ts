import { Module } from "@nestjs/common";
import { ConsoleLogger } from "@novaris/logging";
import {
  ConsoleWhatsAppProvider,
  ConsoleMetaProvider,
  ConsoleBlingProvider,
  ConsoleGoogleCalendarProvider,
  ConsoleGmailProvider,
  ConsoleGoogleSheetsProvider,
  ConsoleGoogleAdsProvider,
} from "@novaris/integration-hub";
import { AuthModule } from "../auth/auth.module.js";
import { IntegrationHubController } from "./integration-hub.controller.js";

/**
 * IntegrationHubModule — Composition Root de `integration-hub` (`ADR-0040`,
 * `ENG-0141`). Todo provider aqui é o adapter Console (estrutural) — trocar
 * por um adapter HTTP real, quando a credencial existir, é só mudar o
 * `useFactory` de cada token, sem tocar no Controller.
 */
@Module({
  imports: [AuthModule],
  controllers: [IntegrationHubController],
  providers: [
    { provide: "WhatsAppProvider", useFactory: () => new ConsoleWhatsAppProvider(new ConsoleLogger()) },
    { provide: "MetaProvider", useFactory: () => new ConsoleMetaProvider(new ConsoleLogger()) },
    { provide: "BlingProvider", useFactory: () => new ConsoleBlingProvider(new ConsoleLogger()) },
    { provide: "GoogleCalendarProvider", useFactory: () => new ConsoleGoogleCalendarProvider(new ConsoleLogger()) },
    { provide: "GmailProvider", useFactory: () => new ConsoleGmailProvider(new ConsoleLogger()) },
    { provide: "GoogleSheetsProvider", useFactory: () => new ConsoleGoogleSheetsProvider(new ConsoleLogger()) },
    { provide: "GoogleAdsProvider", useFactory: () => new ConsoleGoogleAdsProvider(new ConsoleLogger()) },
  ],
})
export class IntegrationHubModule {}
