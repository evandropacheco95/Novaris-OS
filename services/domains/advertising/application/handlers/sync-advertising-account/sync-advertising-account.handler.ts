import { Result, UniqueEntityId, NotFoundError, AuthorizationError, ConflictError, InfrastructureError } from "@novaris/shared-kernel";
import type { DomainError } from "@novaris/shared-kernel";
import type { GoogleAdsProvider, GoogleAdsDateRange } from "@novaris/integration-hub";
import type { AdvertisingAccount } from "../../../domain/aggregates/advertising-account/advertising-account.js";
import { SyncRun } from "../../../domain/aggregates/sync-run/sync-run.js";
import type { AdvertisingAccountRepository } from "../../../domain/repositories/advertising-account-repository.js";
import type { AdCampaignRepository } from "../../../domain/repositories/ad-campaign-repository.js";
import type { AdGroupRepository } from "../../../domain/repositories/ad-group-repository.js";
import type { KeywordRepository } from "../../../domain/repositories/keyword-repository.js";
import type { SearchTermRepository } from "../../../domain/repositories/search-term-repository.js";
import type { SyncRunRepository } from "../../../domain/repositories/sync-run-repository.js";
import type { SyncAdvertisingAccountCommand } from "../../commands/sync-advertising-account/sync-advertising-account.command.js";
import { decryptRefreshToken } from "../../../infrastructure/security/token-cipher.js";
import { upsertCampaigns, upsertAdGroupsAndKeywords, upsertSearchTerms } from "../../shared/advertising-row-upsert.js";

const SYNC_WINDOW_DAYS = 30;

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function lastNDaysRange(days: number): { dateRange: GoogleAdsDateRange; startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  return { dateRange: { startDate: toIsoDate(startDate), endDate: toIsoDate(endDate) }, startDate, endDate };
}

/**
 * SyncAdvertisingAccountHandler — Application Layer, Advertising Domain.
 *
 * Orquestra a sincronização manual completa (`ADR-0060`): valida estado da
 * conta → `requestSync()`/`startSync()` → cria `SyncRun` (`RUNNING`) → lê
 * campanhas/grupos/keywords/termos de busca via `GoogleAdsProvider` → upsert
 * idempotente por natural key (nunca duplica, nunca soma métricas de termo
 * de busca, via `application/shared/advertising-row-upsert.ts` — mesma lógica
 * reaproveitada pelo `ImportAdvertisingReportHandler` para CSV) →
 * `completeSync()`/`SyncRun.complete()` em sucesso, `failSync()`/`SyncRun.fail()`
 * em qualquer falha do provider.
 *
 * Não integra `kernel/audit` — sincronização é uma operação de leitura
 * repetida e de alto volume, não uma ação sensível isolada como `connect()`
 * (mesmo critério de `objects/AdvertisingAccount.md § 17`).
 */
export class SyncAdvertisingAccountHandler {
  constructor(
    private readonly advertisingAccountRepository: AdvertisingAccountRepository,
    private readonly adCampaignRepository: AdCampaignRepository,
    private readonly adGroupRepository: AdGroupRepository,
    private readonly keywordRepository: KeywordRepository,
    private readonly searchTermRepository: SearchTermRepository,
    private readonly syncRunRepository: SyncRunRepository,
    private readonly googleAdsProvider: GoogleAdsProvider,
  ) {}

  async execute(command: SyncAdvertisingAccountCommand): Promise<Result<AdvertisingAccount, DomainError | InfrastructureError>> {
    const advertisingAccountId = new UniqueEntityId(command.advertisingAccountId);

    const findResult = await this.advertisingAccountRepository.findById(advertisingAccountId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`AdvertisingAccount "${command.advertisingAccountId}" não encontrada`));
    }

    const account = option.getOrElse(null as never);
    if (!account.organizationId.equals(new UniqueEntityId(command.organizationId))) {
      return Result.fail(new AuthorizationError("AdvertisingAccount não pertence à Organization do usuário autenticado"));
    }
    if (!account.externalAccountId || !account.encryptedRefreshToken) {
      return Result.fail(new ConflictError("AdvertisingAccount precisa estar conectada (connect()) antes de sincronizar"));
    }

    const requestSyncResult = account.requestSync();
    if (requestSyncResult.isFailure) {
      return Result.fail(requestSyncResult.getError()!);
    }
    await this.advertisingAccountRepository.save(account);

    const startSyncResult = account.startSync();
    if (startSyncResult.isFailure) {
      return Result.fail(startSyncResult.getError()!);
    }
    await this.advertisingAccountRepository.save(account);

    const syncRunResult = SyncRun.create({ organizationId: account.organizationId, advertisingAccountId });
    const syncRun = syncRunResult.getValue()!;
    await this.syncRunRepository.save(syncRun);

    const { dateRange, startDate, endDate } = lastNDaysRange(SYNC_WINDOW_DAYS);
    const customerId = account.externalAccountId;
    const refreshToken = decryptRefreshToken(account.encryptedRefreshToken);

    try {
      const campaignsResult = await this.googleAdsProvider.getCampaignPerformance(customerId, refreshToken, dateRange);
      if (!campaignsResult.success) {
        throw new Error("Falha ao ler campanhas do Google Ads");
      }
      const campaignsSynced = await upsertCampaigns(account, { adCampaignRepository: this.adCampaignRepository }, campaignsResult.data ?? []);

      const adGroupsAndKeywordsResult = await this.googleAdsProvider.getAdGroupsAndKeywordPerformance(customerId, refreshToken, dateRange);
      if (!adGroupsAndKeywordsResult.success) {
        throw new Error("Falha ao ler grupos de anúncios/keywords do Google Ads");
      }
      const { adGroupsSynced, keywordsSynced } = await upsertAdGroupsAndKeywords(
        account,
        { adCampaignRepository: this.adCampaignRepository, adGroupRepository: this.adGroupRepository, keywordRepository: this.keywordRepository },
        { adGroups: adGroupsAndKeywordsResult.data?.adGroups ?? [], keywords: adGroupsAndKeywordsResult.data?.keywords ?? [] },
      );

      const searchTermsResult = await this.googleAdsProvider.getSearchTerms(customerId, refreshToken, dateRange);
      if (!searchTermsResult.success) {
        throw new Error("Falha ao ler termos de busca do Google Ads");
      }
      const searchTermsSynced = await upsertSearchTerms(
        account,
        syncRun,
        { adGroupRepository: this.adGroupRepository, searchTermRepository: this.searchTermRepository },
        searchTermsResult.data ?? [],
        startDate,
        endDate,
      );

      syncRun.complete({ campaignsSynced, adGroupsSynced, keywordsSynced, searchTermsSynced });
      await this.syncRunRepository.save(syncRun);

      account.completeSync();
      await this.advertisingAccountRepository.save(account);

      return Result.ok(account);
    } catch (error) {
      const message = (error as Error).message;
      syncRun.fail(message);
      await this.syncRunRepository.save(syncRun);

      account.failSync();
      await this.advertisingAccountRepository.save(account);

      return Result.fail(new InfrastructureError(`Falha ao sincronizar AdvertisingAccount "${command.advertisingAccountId}": ${message}`));
    }
  }
}
