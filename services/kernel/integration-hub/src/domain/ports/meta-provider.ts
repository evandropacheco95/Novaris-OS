import type { IntegrationResult } from "./integration-result.js";

/**
 * Port do provedor Meta (`ADR-0040`) — operação única representativa:
 * publicar um post em uma Page (Graph API, `POST /{page-id}/feed`). Não
 * cobre Ads, Insights, Messenger — escopo mínimo, não a API inteira.
 */
export interface MetaProvider {
  publishPost(pageId: string, message: string): Promise<IntegrationResult>;
}
