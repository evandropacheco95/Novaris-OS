import type { Logger } from "@novaris/logging";
import type { MetaProvider } from "../domain/ports/meta-provider.js";
import type { IntegrationResult } from "../domain/ports/integration-result.js";

/**
 * Adapter estrutural — não chama a Graph API real (`ADR-0040`, nenhuma
 * credencial existe). Loga o que seria publicado.
 */
export class ConsoleMetaProvider implements MetaProvider {
  constructor(private readonly logger: Logger) {}

  async publishPost(pageId: string, message: string): Promise<IntegrationResult> {
    this.logger.info(`[integration-hub:meta] Post na Page ${pageId}: ${message}`, { loggedOnly: true });
    return { success: true, loggedOnly: true };
  }
}
