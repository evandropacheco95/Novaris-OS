import { Result, UniqueEntityId, NotFoundError, AuthorizationError, ConflictError, InfrastructureError } from "@novaris/shared-kernel";
import type { DomainError } from "@novaris/shared-kernel";
import type { GoogleAdsProvider, GoogleAdsDateRange } from "@novaris/integration-hub";
import type { AdvertisingAccount } from "../../../domain/aggregates/advertising-account/advertising-account.js";
import { AdCampaign } from "../../../domain/aggregates/ad-campaign/ad-campaign.js";
import { AdGroup } from "../../../domain/aggregates/ad-group/ad-group.js";
import { Keyword } from "../../../domain/aggregates/keyword/keyword.js";
import { SearchTerm } from "../../../domain/aggregates/search-term/search-term.js";
import { SyncRun } from "../../../domain/aggregates/sync-run/sync-run.js";
import type { AdvertisingAccountRepository } from "../../../domain/repositories/advertising-account-repository.js";
import type { AdCampaignRepository } from "../../../domain/repositories/ad-campaign-repository.js";
import type { AdGroupRepository } from "../../../domain/repositories/ad-group-repository.js";
import type { KeywordRepository } from "../../../domain/repositories/keyword-repository.js";
import type { SearchTermRepository } from "../../../domain/repositories/search-term-repository.js";
import type { SyncRunRepository } from "../../../domain/repositories/sync-run-repository.js";
import type { SyncAdvertisingAccountCommand } from "../../commands/sync-advertising-account/sync-advertising-account.command.js";
import { decryptRefreshToken } from "../../../infrastructure/security/token-cipher.js";

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
 * de busca) → `completeSync()`/`SyncRun.complete()` em sucesso,
 * `failSync()`/`SyncRun.fail()` em qualquer falha do provider.
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
      const campaignsSynced = await this.syncCampaigns(account, customerId, refreshToken, dateRange);
      const { adGroupsSynced, keywordsSynced, campaignIdByExternalId } = await this.syncAdGroupsAndKeywords(
        account,
        customerId,
        refreshToken,
        dateRange,
      );
      const searchTermsSynced = await this.syncSearchTerms(account, syncRun, customerId, refreshToken, dateRange, startDate, endDate);
      void campaignIdByExternalId;

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

  private async syncCampaigns(
    account: AdvertisingAccount,
    customerId: string,
    refreshToken: string,
    dateRange: GoogleAdsDateRange,
  ): Promise<number> {
    const result = await this.googleAdsProvider.getCampaignPerformance(customerId, refreshToken, dateRange);
    if (!result.success) {
      throw new Error("Falha ao ler campanhas do Google Ads");
    }

    let synced = 0;
    for (const row of result.data ?? []) {
      const existingResult = await this.adCampaignRepository.findByExternalCampaignId(account.id, row.externalCampaignId);
      const existingOption = existingResult.getValue();

      const syncPayload = {
        name: row.name,
        status: row.status,
        channelType: row.channelType,
        lastCostMicros: row.costMicros,
        lastClicks: row.clicks,
        lastImpressions: row.impressions,
        lastConversions: row.conversions,
      };

      if (existingOption?.isSome) {
        const campaign = existingOption.getOrElse(null as never);
        campaign.applySync(syncPayload);
        await this.adCampaignRepository.save(campaign);
      } else {
        const createResult = AdCampaign.create({
          organizationId: account.organizationId,
          advertisingAccountId: account.id,
          externalCampaignId: row.externalCampaignId,
          ...syncPayload,
        });
        if (createResult.isFailure) {
          throw new Error(`Falha ao criar AdCampaign "${row.externalCampaignId}": ${createResult.getError()!.message}`);
        }
        await this.adCampaignRepository.save(createResult.getValue()!);
      }
      synced += 1;
    }
    return synced;
  }

  private async syncAdGroupsAndKeywords(
    account: AdvertisingAccount,
    customerId: string,
    refreshToken: string,
    dateRange: GoogleAdsDateRange,
  ): Promise<{ adGroupsSynced: number; keywordsSynced: number; campaignIdByExternalId: Map<string, UniqueEntityId> }> {
    const result = await this.googleAdsProvider.getAdGroupsAndKeywordPerformance(customerId, refreshToken, dateRange);
    if (!result.success) {
      throw new Error("Falha ao ler grupos de anúncios/keywords do Google Ads");
    }

    const campaignIdByExternalId = new Map<string, UniqueEntityId>();
    const adGroupIdByExternalId = new Map<string, UniqueEntityId>();

    let adGroupsSynced = 0;
    for (const row of result.data?.adGroups ?? []) {
      let campaignId = campaignIdByExternalId.get(row.externalCampaignId);
      if (!campaignId) {
        const campaignResult = await this.adCampaignRepository.findByExternalCampaignId(account.id, row.externalCampaignId);
        const campaignOption = campaignResult.getValue();
        if (!campaignOption?.isSome) {
          continue;
        }
        campaignId = campaignOption.getOrElse(null as never).id;
        campaignIdByExternalId.set(row.externalCampaignId, campaignId);
      }

      const existingResult = await this.adGroupRepository.findByExternalAdGroupId(account.id, row.externalAdGroupId);
      const existingOption = existingResult.getValue();
      const syncPayload = { name: row.name, status: row.status };

      let adGroupId: UniqueEntityId;
      if (existingOption?.isSome) {
        const adGroup = existingOption.getOrElse(null as never);
        adGroup.applySync(syncPayload);
        await this.adGroupRepository.save(adGroup);
        adGroupId = adGroup.id;
      } else {
        const createResult = AdGroup.create({
          organizationId: account.organizationId,
          advertisingAccountId: account.id,
          adCampaignId: campaignId,
          externalAdGroupId: row.externalAdGroupId,
          ...syncPayload,
        });
        if (createResult.isFailure) {
          throw new Error(`Falha ao criar AdGroup "${row.externalAdGroupId}": ${createResult.getError()!.message}`);
        }
        const adGroup = createResult.getValue()!;
        await this.adGroupRepository.save(adGroup);
        adGroupId = adGroup.id;
      }
      adGroupIdByExternalId.set(row.externalAdGroupId, adGroupId);
      adGroupsSynced += 1;
    }

    let keywordsSynced = 0;
    for (const row of result.data?.keywords ?? []) {
      const adGroupId = adGroupIdByExternalId.get(row.externalAdGroupId);
      if (!adGroupId) {
        continue;
      }

      const existingResult = await this.keywordRepository.findByExternalCriterionId(account.id, row.externalCriterionId);
      const existingOption = existingResult.getValue();
      const syncPayload = {
        text: row.text,
        matchType: row.matchType,
        status: row.status,
        qualityScore: row.qualityScore,
        lastCostMicros: row.costMicros,
        lastClicks: row.clicks,
        lastImpressions: row.impressions,
      };

      if (existingOption?.isSome) {
        const keyword = existingOption.getOrElse(null as never);
        const applyResult = keyword.applySync(syncPayload);
        if (applyResult.isFailure) {
          throw new Error(`Falha ao atualizar Keyword "${row.externalCriterionId}": ${applyResult.getError()!.message}`);
        }
        await this.keywordRepository.save(keyword);
      } else {
        const createResult = Keyword.create({
          organizationId: account.organizationId,
          advertisingAccountId: account.id,
          adGroupId,
          externalCriterionId: row.externalCriterionId,
          ...syncPayload,
        });
        if (createResult.isFailure) {
          throw new Error(`Falha ao criar Keyword "${row.externalCriterionId}": ${createResult.getError()!.message}`);
        }
        await this.keywordRepository.save(createResult.getValue()!);
      }
      keywordsSynced += 1;
    }

    return { adGroupsSynced, keywordsSynced, campaignIdByExternalId };
  }

  private async syncSearchTerms(
    account: AdvertisingAccount,
    syncRun: SyncRun,
    customerId: string,
    refreshToken: string,
    dateRange: GoogleAdsDateRange,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.googleAdsProvider.getSearchTerms(customerId, refreshToken, dateRange);
    if (!result.success) {
      throw new Error("Falha ao ler termos de busca do Google Ads");
    }

    let synced = 0;
    for (const row of result.data ?? []) {
      const adGroupResult = await this.adGroupRepository.findByExternalAdGroupId(account.id, row.externalAdGroupId);
      const adGroupOption = adGroupResult.getValue();
      if (!adGroupOption?.isSome) {
        continue;
      }
      const adGroupId = adGroupOption.getOrElse(null as never).id;

      const existingResult = await this.searchTermRepository.findByNaturalKey(account.id, adGroupId, row.searchTerm, startDate, endDate);
      const existingOption = existingResult.getValue();
      if (existingOption?.isSome) {
        await this.searchTermRepository.delete(existingOption.getOrElse(null as never).id);
      }

      const createResult = SearchTerm.create({
        organizationId: account.organizationId,
        advertisingAccountId: account.id,
        adGroupId,
        syncRunId: syncRun.id,
        searchTerm: row.searchTerm,
        dateRangeStart: startDate,
        dateRangeEnd: endDate,
        clicks: row.clicks,
        impressions: row.impressions,
        conversions: row.conversions,
        costMicros: row.costMicros,
      });
      if (createResult.isFailure) {
        throw new Error(`Falha ao criar SearchTerm "${row.searchTerm}": ${createResult.getError()!.message}`);
      }
      await this.searchTermRepository.save(createResult.getValue()!);
      synced += 1;
    }
    return synced;
  }
}
