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

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const API_VERSION = "v17";

export interface HttpGoogleAdsProviderConfig {
  developerToken: string;
  oauthClientId: string;
  oauthClientSecret: string;
}

interface GoogleAdsSearchResponse {
  results?: Array<Record<string, Record<string, unknown>>>;
  error?: { message?: string };
}

function readField(row: Record<string, Record<string, unknown>>, path: string): unknown {
  const separatorIndex = path.indexOf(".");
  const entity = path.slice(0, separatorIndex);
  const field = path.slice(separatorIndex + 1);
  return row[entity]?.[field];
}

/**
 * Adapter real de `GoogleAdsProvider` (`ADR-0060`) — REST direto contra
 * `googleads.googleapis.com`, sem dependência npm nova (`fetch` nativo do
 * Node 20+, mesma preferência já usada em `packages/database/src/index.ts`
 * com `process.loadEnvFile`). **Não é o adapter padrão** em
 * `IntegrationHubModule` — `ConsoleGoogleAdsProvider` continua ativo até a
 * credencial de Winnet ser aprovada para Basic Access. Testado com `fetch`
 * mockado, nunca chamado contra a API real neste ambiente.
 *
 * As queries GAQL abaixo reaproveitam como referência as 4 queries do
 * protótipo `Desktop/Winnet/google-ads-analyzer/data_source.py` — nunca o
 * código Python nem seu fallback de dado simulado — adaptadas para incluir
 * `campaign.id`/`ad_group.id`/`ad_group.name`, necessários para popular
 * `Ad Campaign`/`Ad Group` como entidades (o protótipo só exibia os dados).
 */
export class HttpGoogleAdsProvider implements GoogleAdsProvider {
  constructor(
    private readonly config: HttpGoogleAdsProviderConfig,
    private readonly logger: Logger,
  ) {}

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: this.config.oauthClientId,
        client_secret: this.config.oauthClientSecret,
      }).toString(),
    });
    if (!response.ok) {
      throw new Error(`Falha ao renovar access token do Google Ads: HTTP ${response.status}`);
    }
    const body = (await response.json()) as { access_token?: string };
    if (!body.access_token) {
      throw new Error("Resposta de refresh de token do Google Ads sem \"access_token\"");
    }
    return body.access_token;
  }

  private async search(customerId: string, refreshToken: string, query: string): Promise<Record<string, Record<string, unknown>>[]> {
    const accessToken = await this.refreshAccessToken(refreshToken);
    const response = await fetch(`https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}/googleAds:search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "developer-token": this.config.developerToken,
      },
      body: JSON.stringify({ query }),
    });
    const body = (await response.json()) as GoogleAdsSearchResponse;
    if (!response.ok) {
      throw new Error(`Google Ads API retornou HTTP ${response.status}: ${body.error?.message ?? "erro desconhecido"}`);
    }
    return body.results ?? [];
  }

  async createCampaign(name: string, budget: number): Promise<IntegrationResult> {
    this.logger.warn(`[integration-hub:google-ads:http] createCampaign("${name}", ${budget}) não implementado — escrita fora do escopo da Fase 02`);
    return { success: false, loggedOnly: false };
  }

  async testConnection(customerId: string, refreshToken: string): Promise<IntegrationResult<{ accountName?: string }>> {
    try {
      const rows = await this.search(customerId, refreshToken, "SELECT customer.descriptive_name FROM customer LIMIT 1");
      const accountName = rows[0] ? (readField(rows[0], "customer.descriptive_name") as string | undefined) : undefined;
      return { success: true, loggedOnly: false, data: { accountName } };
    } catch (error) {
      this.logger.error(`[integration-hub:google-ads:http] testConnection("${customerId}") falhou`, { error });
      return { success: false, loggedOnly: false };
    }
  }

  async getCampaignPerformance(
    customerId: string,
    refreshToken: string,
    dateRange: GoogleAdsDateRange,
  ): Promise<IntegrationResult<GoogleAdsCampaignRow[]>> {
    try {
      const query = `
        SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
               metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions
        FROM campaign
        WHERE segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
      `.trim();
      const rows = await this.search(customerId, refreshToken, query);
      const data: GoogleAdsCampaignRow[] = rows.map((row) => ({
        externalCampaignId: String(readField(row, "campaign.id")),
        name: String(readField(row, "campaign.name")),
        status: String(readField(row, "campaign.status")),
        channelType: String(readField(row, "campaign.advertising_channel_type")),
        costMicros: Number(readField(row, "metrics.cost_micros") ?? 0),
        clicks: Number(readField(row, "metrics.clicks") ?? 0),
        impressions: Number(readField(row, "metrics.impressions") ?? 0),
        conversions: Number(readField(row, "metrics.conversions") ?? 0),
      }));
      return { success: true, loggedOnly: false, data };
    } catch (error) {
      this.logger.error(`[integration-hub:google-ads:http] getCampaignPerformance("${customerId}") falhou`, { error });
      return { success: false, loggedOnly: false };
    }
  }

  async getAdGroupsAndKeywordPerformance(
    customerId: string,
    refreshToken: string,
    dateRange: GoogleAdsDateRange,
  ): Promise<IntegrationResult<{ adGroups: GoogleAdsAdGroupRef[]; keywords: GoogleAdsKeywordRow[] }>> {
    try {
      const query = `
        SELECT ad_group.id, ad_group.name, ad_group.status, ad_group.campaign,
               ad_group_criterion.criterion_id, ad_group_criterion.keyword.text,
               ad_group_criterion.keyword.match_type, ad_group_criterion.status,
               ad_group_criterion.quality_info.quality_score,
               metrics.cost_micros, metrics.clicks, metrics.impressions
        FROM keyword_view
        WHERE segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
      `.trim();
      const rows = await this.search(customerId, refreshToken, query);

      const adGroupsById = new Map<string, GoogleAdsAdGroupRef>();
      const keywords: GoogleAdsKeywordRow[] = [];
      for (const row of rows) {
        const externalAdGroupId = String(readField(row, "ad_group.id"));
        const campaignResourceName = String(readField(row, "ad_group.campaign") ?? "");
        const externalCampaignId = campaignResourceName.split("/").pop() ?? "";
        if (!adGroupsById.has(externalAdGroupId)) {
          adGroupsById.set(externalAdGroupId, {
            externalAdGroupId,
            externalCampaignId,
            name: String(readField(row, "ad_group.name")),
            status: String(readField(row, "ad_group.status")),
          });
        }
        keywords.push({
          externalCriterionId: String(readField(row, "ad_group_criterion.criterion_id")),
          externalAdGroupId,
          text: String(readField(row, "ad_group_criterion.keyword.text")),
          matchType: String(readField(row, "ad_group_criterion.keyword.match_type")),
          status: String(readField(row, "ad_group_criterion.status")),
          qualityScore: readField(row, "ad_group_criterion.quality_info.quality_score") as number | undefined,
          costMicros: Number(readField(row, "metrics.cost_micros") ?? 0),
          clicks: Number(readField(row, "metrics.clicks") ?? 0),
          impressions: Number(readField(row, "metrics.impressions") ?? 0),
        });
      }
      return { success: true, loggedOnly: false, data: { adGroups: Array.from(adGroupsById.values()), keywords } };
    } catch (error) {
      this.logger.error(`[integration-hub:google-ads:http] getAdGroupsAndKeywordPerformance("${customerId}") falhou`, { error });
      return { success: false, loggedOnly: false };
    }
  }

  async getSearchTerms(
    customerId: string,
    refreshToken: string,
    dateRange: GoogleAdsDateRange,
  ): Promise<IntegrationResult<GoogleAdsSearchTermRow[]>> {
    try {
      const query = `
        SELECT ad_group.id, search_term_view.search_term,
               metrics.clicks, metrics.impressions, metrics.conversions, metrics.cost_micros
        FROM search_term_view
        WHERE segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
      `.trim();
      const rows = await this.search(customerId, refreshToken, query);
      const data: GoogleAdsSearchTermRow[] = rows.map((row) => ({
        externalAdGroupId: String(readField(row, "ad_group.id")),
        searchTerm: String(readField(row, "search_term_view.search_term")),
        clicks: Number(readField(row, "metrics.clicks") ?? 0),
        impressions: Number(readField(row, "metrics.impressions") ?? 0),
        conversions: Number(readField(row, "metrics.conversions") ?? 0),
        costMicros: Number(readField(row, "metrics.cost_micros") ?? 0),
      }));
      return { success: true, loggedOnly: false, data };
    } catch (error) {
      this.logger.error(`[integration-hub:google-ads:http] getSearchTerms("${customerId}") falhou`, { error });
      return { success: false, loggedOnly: false };
    }
  }
}
