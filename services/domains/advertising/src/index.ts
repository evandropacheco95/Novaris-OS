// Advertising Domain Service — barrel de exportação pública.
// Populado conforme cada camada ganha implementação real.

export {
  AdvertisingAccount,
  type AdvertisingAccountProps,
  type CreateAdvertisingAccountInput,
  type AdvertisingProvider,
  type AdvertisingAccountConnectionStatus,
} from "../domain/aggregates/advertising-account/advertising-account.js";

export { AdCampaign, type AdCampaignProps, type CreateAdCampaignInput, type ApplyAdCampaignSyncInput } from "../domain/aggregates/ad-campaign/ad-campaign.js";
export { AdGroup, type AdGroupProps, type CreateAdGroupInput, type ApplyAdGroupSyncInput } from "../domain/aggregates/ad-group/ad-group.js";
export { Keyword, type KeywordProps, type CreateKeywordInput, type ApplyKeywordSyncInput } from "../domain/aggregates/keyword/keyword.js";
export { SearchTerm, type SearchTermProps, type CreateSearchTermInput } from "../domain/aggregates/search-term/search-term.js";
export { SyncRun, type SyncRunProps, type SyncRunStatus, type CreateSyncRunInput, type CompleteSyncRunInput } from "../domain/aggregates/sync-run/sync-run.js";

export type { AdvertisingAccountRepository } from "../domain/repositories/advertising-account-repository.js";
export type { AdCampaignRepository } from "../domain/repositories/ad-campaign-repository.js";
export type { AdGroupRepository } from "../domain/repositories/ad-group-repository.js";
export type { KeywordRepository } from "../domain/repositories/keyword-repository.js";
export type { SearchTermRepository } from "../domain/repositories/search-term-repository.js";
export type { SyncRunRepository } from "../domain/repositories/sync-run-repository.js";

export { AdvertisingAccountConnected } from "../domain/events/advertising-account-connected.js";
export { AdvertisingAccountSyncCompleted } from "../domain/events/advertising-account-sync-completed.js";
export { AdvertisingAccountSyncFailed } from "../domain/events/advertising-account-sync-failed.js";

// Application Layer
export { CreateAdvertisingAccountCommand } from "../application/commands/create-advertising-account/create-advertising-account.command.js";
export { CreateAdvertisingAccountHandler } from "../application/handlers/create-advertising-account/create-advertising-account.handler.js";
export { ConnectAdvertisingAccountCommand } from "../application/commands/connect-advertising-account/connect-advertising-account.command.js";
export { ConnectAdvertisingAccountHandler } from "../application/handlers/connect-advertising-account/connect-advertising-account.handler.js";
export { SyncAdvertisingAccountCommand } from "../application/commands/sync-advertising-account/sync-advertising-account.command.js";
export { SyncAdvertisingAccountHandler } from "../application/handlers/sync-advertising-account/sync-advertising-account.handler.js";

// Infrastructure — segurança
export { encryptRefreshToken, decryptRefreshToken } from "../infrastructure/security/token-cipher.js";
export {
  type GoogleOAuthClient,
  HttpGoogleOAuthClient,
  type HttpGoogleOAuthClientConfig,
} from "../infrastructure/security/google-oauth-client.js";

// Factories de Infrastructure — mantêm as classes concretas privadas ao pacote.
export {
  createAdvertisingAccountRepository,
  createAdCampaignRepository,
  createAdGroupRepository,
  createKeywordRepository,
  createSearchTermRepository,
  createSyncRunRepository,
} from "../infrastructure/factories.js";
