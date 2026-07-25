import type { Logger } from "@novaris/logging";
import type { WhatsAppProvider } from "../domain/ports/whatsapp-provider.js";
import type { IntegrationResult } from "../domain/ports/integration-result.js";

/**
 * Adapter estrutural — não chama a WhatsApp Cloud API real (`ADR-0040`,
 * nenhuma credencial existe). Loga o que seria enviado; substituível por um
 * adapter HTTP real sem mudar o Port.
 */
export class ConsoleWhatsAppProvider implements WhatsAppProvider {
  constructor(private readonly logger: Logger) {}

  async sendMessage(to: string, message: string): Promise<IntegrationResult> {
    this.logger.info(`[integration-hub:whatsapp] Mensagem para ${to}: ${message}`, { loggedOnly: true });
    return { success: true, loggedOnly: true };
  }
}
