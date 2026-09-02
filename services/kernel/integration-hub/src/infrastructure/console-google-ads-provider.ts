import type { Logger } from "@novaris/logging";
import type {
  GoogleAdsAdGroupRef,
  GoogleAdsCampaignRow,
  GoogleAdsDateRange,
  GoogleAdsKeywordRow,
  GoogleAdsProvider,
  GoogleAdsSearchTermRow,
} from "../domain/ports/google-ads-provider.js";
import type { IntegrationResult } from "../domain/ports/integration-result.js";

/**
 * Adapter estrutural — não chama Google Ads API real (`ADR-0040`, nenhuma
 * credencial existe). Loga a operação que seria feita e retorna listas
 * vazias, nunca dado simulado (`NOVARIS_CONSTITUTION.md`, "never invent
 * data") — continua sendo o adapter padrão em `IntegrationHubModule` até a
 * credencial de Winnet ser aprovada (`ADR-0060`).
 */
export class ConsoleGoogleAdsProvider implements GoogleAdsProvider {
  constructor(private readonly logger: Logger) {}

  async createCampaign(name: string, budget: number): Promise<IntegrationResult> {
    this.logger.info(`[integration-hub:google-ads] Campanha "${name}" criada com orçamento R$ ${budget.toFixed(2)}`, { loggedOnly: true });
    return { success: true, loggedOnly: true };
  }

  async testConnection(customerId: string): Promise<IntegrationResult<{ accountName?: string }>> {
    this.logger.info(`[integration-hub:google-ads] testConnection("${customerId}") — estrutural, nenhuma chamada real`, { loggedOnly: true });
    return { success: true, loggedOnly: true, data: {} };
  }

  async getCampaignPerformance(
    customerId: string,
    _refreshToken: string,
    dateRange: GoogleAdsDateRange,
  ): Promise<IntegrationResult<GoogleAdsCampaignRow[]>> {
    this.logger.info(
      `[integration-hub:google-ads] getCampaignPerformance("${customerId}", ${dateRange.startDate}..${dateRange.endDate}) — estrutural, nenhuma chamada real`,
      { loggedOnly: true },
    );
    return { success: true, loggedOnly: true, data: [] };
  }

  async getAdGroupsAndKeywordPerformance(
    customerId: string,
    _refreshToken: string,
    dateRange: GoogleAdsDateRange,
  ): Promise<IntegrationResult<{ adGroups: GoogleAdsAdGroupRef[]; keywords: GoogleAdsKeywordRow[] }>> {
    this.logger.info(
      `[integration-hub:google-ads] getAdGroupsAndKeywordPerformance("${customerId}", ${dateRange.startDate}..${dateRange.endDate}) — estrutural, nenhuma chamada real`,
      { loggedOnly: true },
    );
    return { success: true, loggedOnly: true, data: { adGroups: [], keywords: [] } };
  }

  async getSearchTerms(
    customerId: string,
    _refreshToken: string,
    dateRange: GoogleAdsDateRange,
  ): Promise<IntegrationResult<GoogleAdsSearchTermRow[]>> {
    this.logger.info(
      `[integration-hub:google-ads] getSearchTerms("${customerId}", ${dateRange.startDate}..${dateRange.endDate}) — estrutural, nenhuma chamada real`,
      { loggedOnly: true },
    );
    return { success: true, loggedOnly: true, data: [] };
  }
}
