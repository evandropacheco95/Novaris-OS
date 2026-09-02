import type { PrismaClient } from "@novaris/database";
import type { AdvertisingAccountRepository } from "../domain/repositories/advertising-account-repository.js";
import type { AdCampaignRepository } from "../domain/repositories/ad-campaign-repository.js";
import type { AdGroupRepository } from "../domain/repositories/ad-group-repository.js";
import type { KeywordRepository } from "../domain/repositories/keyword-repository.js";
import type { SearchTermRepository } from "../domain/repositories/search-term-repository.js";
import type { SyncRunRepository } from "../domain/repositories/sync-run-repository.js";
import { PrismaAdvertisingAccountRepository } from "./repositories/prisma-advertising-account-repository.js";
import { PrismaAdCampaignRepository } from "./repositories/prisma-ad-campaign-repository.js";
import { PrismaAdGroupRepository } from "./repositories/prisma-ad-group-repository.js";
import { PrismaKeywordRepository } from "./repositories/prisma-keyword-repository.js";
import { PrismaSearchTermRepository } from "./repositories/prisma-search-term-repository.js";
import { PrismaSyncRunRepository } from "./repositories/prisma-sync-run-repository.js";

/** Factories de Infrastructure — mantêm classes concretas privadas ao pacote. Mesmo padrão de `@novaris/marketing`. */
export function createAdvertisingAccountRepository(client: PrismaClient): AdvertisingAccountRepository {
  return new PrismaAdvertisingAccountRepository(client);
}

export function createAdCampaignRepository(client: PrismaClient): AdCampaignRepository {
  return new PrismaAdCampaignRepository(client);
}

export function createAdGroupRepository(client: PrismaClient): AdGroupRepository {
  return new PrismaAdGroupRepository(client);
}

export function createKeywordRepository(client: PrismaClient): KeywordRepository {
  return new PrismaKeywordRepository(client);
}

export function createSearchTermRepository(client: PrismaClient): SearchTermRepository {
  return new PrismaSearchTermRepository(client);
}

export function createSyncRunRepository(client: PrismaClient): SyncRunRepository {
  return new PrismaSyncRunRepository(client);
}
