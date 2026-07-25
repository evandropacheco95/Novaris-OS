import type { IntegrationResult } from "./integration-result.js";

/**
 * Port do provedor WhatsApp (`ADR-0040`) — operação única representativa:
 * envio de mensagem de texto (WhatsApp Cloud API, `POST /messages`). Não
 * cobre templates, mídia, webhooks de recebimento — escopo mínimo, não a
 * API inteira.
 */
export interface WhatsAppProvider {
  sendMessage(to: string, message: string): Promise<IntegrationResult>;
}
