import type { Logger } from "@novaris/logging";
import type { GoogleAdsProvider } from "../domain/ports/google-ads-provider.js";
import type { IntegrationResult } from "../domain/ports/integration-result.js";

/**
 * Adapter estrutural — não chama a Google Ads API real (`ADR-0040`, nenhuma
 * credencial existe). Loga a campanha que seria criada.
 */
export class ConsoleGoogleAdsProvider implements GoogleAdsProvider {
  constructor(private readonly logger: Logger) {}

  async createCampaign(name: string, budget: number): Promise<IntegrationResult> {
    this.logger.info(`[integration-hub:google-ads] Campanha "${name}" criada com orçamento R$ ${budget.toFixed(2)}`, { loggedOnly: true });
    return { success: true, loggedOnly: true };
  }
}
