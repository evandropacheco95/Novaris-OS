import type { IntegrationResult } from "./integration-result.js";

/** Janela de datas de uma consulta GAQL — `YYYY-MM-DD`, inclusive nas duas pontas. */
export interface GoogleAdsDateRange {
  startDate: string;
  endDate: string;
}

export interface GoogleAdsCampaignRow {
  externalCampaignId: string;
  name: string;
  status: string;
  channelType: string;
  costMicros: number;
  clicks: number;
  impressions: number;
  conversions: number;
}

export interface GoogleAdsAdGroupRef {
  externalAdGroupId: string;
  externalCampaignId: string;
  name: string;
  status: string;
}

export interface GoogleAdsKeywordRow {
  externalCriterionId: string;
  externalAdGroupId: string;
  text: string;
  matchType: string;
  status: string;
  qualityScore?: number;
  costMicros: number;
  clicks: number;
  impressions: number;
}

export interface GoogleAdsSearchTermRow {
  externalAdGroupId: string;
  searchTerm: string;
  clicks: number;
  impressions: number;
  conversions: number;
  costMicros: number;
}

/**
 * Port do provedor Google Ads (`ADR-0040`, estendido por `ADR-0060`).
 * Cada método de leitura recebe `refreshToken` por chamada — diferente do
 * padrão de token único global (`.env`) dos outros 6 provedores — porque
 * cada `AdvertisingAccount` tem sua própria credencial OAuth
 * (`objects/AdvertisingAccount.md § 5`).
 *
 * `getAccountDailySeries` **não faz parte deste Port** — histórico diário é
 * responsabilidade de `PerformanceSnapshot` (Analytics Domain, Fase 03), não
 * de leitura direta de `Ad Campaign`/`Ad Group` (`ADR-0060`, Alternativas).
 */
export interface GoogleAdsProvider {
  createCampaign(name: string, budget: number): Promise<IntegrationResult>;

  testConnection(customerId: string, refreshToken: string): Promise<IntegrationResult<{ accountName?: string }>>;

  getCampaignPerformance(
    customerId: string,
    refreshToken: string,
    dateRange: GoogleAdsDateRange,
  ): Promise<IntegrationResult<GoogleAdsCampaignRow[]>>;

  getAdGroupsAndKeywordPerformance(
    customerId: string,
    refreshToken: string,
    dateRange: GoogleAdsDateRange,
  ): Promise<IntegrationResult<{ adGroups: GoogleAdsAdGroupRef[]; keywords: GoogleAdsKeywordRow[] }>>;

  getSearchTerms(
    customerId: string,
    refreshToken: string,
    dateRange: GoogleAdsDateRange,
  ): Promise<IntegrationResult<GoogleAdsSearchTermRow[]>>;
}
