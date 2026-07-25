import type { Logger } from "@novaris/logging";
import type { GmailProvider } from "../domain/ports/gmail-provider.js";
import type { IntegrationResult } from "../domain/ports/integration-result.js";

/**
 * Adapter estrutural — não chama a Gmail API real (`ADR-0040`, nenhuma
 * credencial existe). Loga o e-mail que seria enviado.
 */
export class ConsoleGmailProvider implements GmailProvider {
  constructor(private readonly logger: Logger) {}

  async sendEmail(to: string, subject: string, body: string): Promise<IntegrationResult> {
    this.logger.info(`[integration-hub:gmail] E-mail para ${to} — assunto: "${subject}"`, { loggedOnly: true, body });
    return { success: true, loggedOnly: true };
  }
}
