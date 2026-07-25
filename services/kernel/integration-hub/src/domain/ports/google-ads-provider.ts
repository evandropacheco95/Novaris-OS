import type { IntegrationResult } from "./integration-result.js";

/** Port do provedor Google Ads (`ADR-0040`) — criar uma campanha simples. */
export interface GoogleAdsProvider {
  createCampaign(name: string, budget: number): Promise<IntegrationResult>;
}
