// Integration Hub Service — barrel de exportação pública.
// Todos os adapters aqui são estruturais (`ADR-0040`) — nenhuma credencial
// real existe para nenhum dos 7 provedores; nenhum loga sem `loggedOnly: true`.

export type { IntegrationResult } from "./domain/ports/integration-result.js";

export type { WhatsAppProvider } from "./domain/ports/whatsapp-provider.js";
export { ConsoleWhatsAppProvider } from "./infrastructure/console-whatsapp-provider.js";

export type { MetaProvider } from "./domain/ports/meta-provider.js";
export { ConsoleMetaProvider } from "./infrastructure/console-meta-provider.js";

export type { BlingProvider } from "./domain/ports/bling-provider.js";
export { ConsoleBlingProvider } from "./infrastructure/console-bling-provider.js";

export type { GoogleCalendarProvider } from "./domain/ports/google-calendar-provider.js";
export { ConsoleGoogleCalendarProvider } from "./infrastructure/console-google-calendar-provider.js";

export type { GmailProvider } from "./domain/ports/gmail-provider.js";
export { ConsoleGmailProvider } from "./infrastructure/console-gmail-provider.js";

export type { GoogleSheetsProvider } from "./domain/ports/google-sheets-provider.js";
export { ConsoleGoogleSheetsProvider } from "./infrastructure/console-google-sheets-provider.js";

export type { GoogleAdsProvider } from "./domain/ports/google-ads-provider.js";
export { ConsoleGoogleAdsProvider } from "./infrastructure/console-google-ads-provider.js";
