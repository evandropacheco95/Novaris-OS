import type { IntegrationResult } from "./integration-result.js";

/** Port do provedor Gmail (`ADR-0040`) — enviar um e-mail simples (texto). */
export interface GmailProvider {
  sendEmail(to: string, subject: string, body: string): Promise<IntegrationResult>;
}
