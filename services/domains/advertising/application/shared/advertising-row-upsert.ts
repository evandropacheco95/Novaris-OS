import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { GoogleAdsCampaignRow, GoogleAdsAdGroupRef, GoogleAdsKeywordRow, GoogleAdsSearchTermRow } from "@novaris/integration-hub";
import type { AdvertisingAccount } from "../../domain/aggregates/advertising-account/advertising-account.js";
import { AdCampaign } from "../../domain/aggregates/ad-campaign/ad-campaign.js";
import { AdGroup } from "../../domain/aggregates/ad-group/ad-group.js";
import { Keyword } from "../../domain/aggregates/keyword/keyword.js";
import { SearchTerm } from "../../domain/aggregates/search-term/search-term.js";
import type { SyncRun } from "../../domain/aggregates/sync-run/sync-run.js";
import type { AdCampaignRepository } from "../../domain/repositories/ad-campaign-repository.js";
import type { AdGroupRepository } from "../../domain/repositories/ad-group-repository.js";
import type { KeywordRepository } from "../../domain/repositories/keyword-repository.js";
import type { SearchTermRepository } from "../../domain/repositories/search-term-repository.js";

/**
 * `advertising-row-upsert.ts` — lógica de upsert idempotente por natural key
 * (`ADR-0060`), extraída de `SyncAdvertisingAccountHandler` para ser
 * reaproveitada tanto pelo sync ao vivo (`GoogleAdsProvider`) quanto pelo
 * import manual de CSV (`ImportAdvertisingReportHandler`). As duas fontes
 * produzem exatamente os mesmos tipos de linha (`GoogleAdsCampaignRow` etc,
 * de `@novaris/integration-hub`) — a única diferença é de onde a linha veio,
 * nunca como ela é persistida.
 */

export async function upsertCampaigns(
  account: AdvertisingAccount,
  repositories: { adCampaignRepository: AdCampaignRepository },
  rows: GoogleAdsCampaignRow[],
): Promise<number> {
  let synced = 0;
  for (const row of rows) {
    const existingResult = await repositories.adCampaignRepository.findByExternalCampaignId(account.id, row.externalCampaignId);
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
      await repositories.adCampaignRepository.save(campaign);
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
      await repositories.adCampaignRepository.save(createResult.getValue()!);
    }
    synced += 1;
  }
  return synced;
}

export async function upsertAdGroupsAndKeywords(
  account: AdvertisingAccount,
  repositories: { adCampaignRepository: AdCampaignRepository; adGroupRepository: AdGroupRepository; keywordRepository: KeywordRepository },
  rows: { adGroups: GoogleAdsAdGroupRef[]; keywords: GoogleAdsKeywordRow[] },
): Promise<{ adGroupsSynced: number; keywordsSynced: number; campaignIdByExternalId: Map<string, UniqueEntityId> }> {
  const campaignIdByExternalId = new Map<string, UniqueEntityId>();
  const adGroupIdByExternalId = new Map<string, UniqueEntityId>();

  let adGroupsSynced = 0;
  for (const row of rows.adGroups) {
    let campaignId = campaignIdByExternalId.get(row.externalCampaignId);
    if (!campaignId) {
      const campaignResult = await repositories.adCampaignRepository.findByExternalCampaignId(account.id, row.externalCampaignId);
      const campaignOption = campaignResult.getValue();
      if (!campaignOption?.isSome) {
        continue;
      }
      campaignId = campaignOption.getOrElse(null as never).id;
      campaignIdByExternalId.set(row.externalCampaignId, campaignId);
    }

    const existingResult = await repositories.adGroupRepository.findByExternalAdGroupId(account.id, row.externalAdGroupId);
    const existingOption = existingResult.getValue();
    const syncPayload = { name: row.name, status: row.status };

    let adGroupId: UniqueEntityId;
    if (existingOption?.isSome) {
      const adGroup = existingOption.getOrElse(null as never);
      adGroup.applySync(syncPayload);
      await repositories.adGroupRepository.save(adGroup);
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
      await repositories.adGroupRepository.save(adGroup);
      adGroupId = adGroup.id;
    }
    adGroupIdByExternalId.set(row.externalAdGroupId, adGroupId);
    adGroupsSynced += 1;
  }

  let keywordsSynced = 0;
  for (const row of rows.keywords) {
    const adGroupId = adGroupIdByExternalId.get(row.externalAdGroupId);
    if (!adGroupId) {
      continue;
    }

    const existingResult = await repositories.keywordRepository.findByExternalCriterionId(account.id, row.externalCriterionId);
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
      await repositories.keywordRepository.save(keyword);
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
      await repositories.keywordRepository.save(createResult.getValue()!);
    }
    keywordsSynced += 1;
  }

  return { adGroupsSynced, keywordsSynced, campaignIdByExternalId };
}

/**
 * Linha de keyword vinda do import de CSV — mesmos campos de
 * `GoogleAdsKeywordRow`, exceto que traz `adGroupName` em vez de
 * `externalAdGroupId`: o relatório de palavras-chave exportado pela UI do
 * Google Ads não inclui o ID externo do grupo de anúncios, só o nome
 * (`google-ads-csv-column-map.ts`, infrastructure).
 */
export interface CsvKeywordRow {
  externalCriterionId: string;
  adGroupName: string;
  text: string;
  matchType: string;
  status: string;
  qualityScore?: number;
  costMicros: number;
  clicks: number;
  impressions: number;
}

/**
 * Variante de `upsertAdGroupsAndKeywords` para import de CSV — resolve o
 * `AdGroup` pai por nome (`AdGroupRepository.findByName`) em vez de por
 * `externalAdGroupId` (ausente no relatório de palavras-chave). Linhas cujo
 * `adGroupName` não bate com nenhum `AdGroup` já existente são puladas
 * (contadas em `skipped`) — o import de grupos de anúncios precisa rodar
 * antes do de palavras-chave para que o join encontre o `AdGroup`.
 */
export async function upsertKeywordsByAdGroupName(
  account: AdvertisingAccount,
  repositories: { adGroupRepository: AdGroupRepository; keywordRepository: KeywordRepository },
  rows: CsvKeywordRow[],
): Promise<{ keywordsSynced: number; skipped: number }> {
  const adGroupIdByName = new Map<string, UniqueEntityId>();
  let keywordsSynced = 0;
  let skipped = 0;

  for (const row of rows) {
    let adGroupId = adGroupIdByName.get(row.adGroupName);
    if (!adGroupId) {
      const adGroupResult = await repositories.adGroupRepository.findByName(account.id, row.adGroupName);
      const adGroupOption = adGroupResult.getValue();
      if (!adGroupOption?.isSome) {
        skipped += 1;
        continue;
      }
      adGroupId = adGroupOption.getOrElse(null as never).id;
      adGroupIdByName.set(row.adGroupName, adGroupId);
    }

    const existingResult = await repositories.keywordRepository.findByExternalCriterionId(account.id, row.externalCriterionId);
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
      await repositories.keywordRepository.save(keyword);
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
      await repositories.keywordRepository.save(createResult.getValue()!);
    }
    keywordsSynced += 1;
  }

  return { keywordsSynced, skipped };
}

export async function upsertSearchTerms(
  account: AdvertisingAccount,
  syncRun: SyncRun,
  repositories: { adGroupRepository: AdGroupRepository; searchTermRepository: SearchTermRepository },
  rows: GoogleAdsSearchTermRow[],
  startDate: Date,
  endDate: Date,
): Promise<number> {
  let synced = 0;
  for (const row of rows) {
    const adGroupResult = await repositories.adGroupRepository.findByExternalAdGroupId(account.id, row.externalAdGroupId);
    const adGroupOption = adGroupResult.getValue();
    if (!adGroupOption?.isSome) {
      continue;
    }
    const adGroupId = adGroupOption.getOrElse(null as never).id;

    const existingResult = await repositories.searchTermRepository.findByNaturalKey(account.id, adGroupId, row.searchTerm, startDate, endDate);
    const existingOption = existingResult.getValue();
    if (existingOption?.isSome) {
      await repositories.searchTermRepository.delete(existingOption.getOrElse(null as never).id);
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
    await repositories.searchTermRepository.save(createResult.getValue()!);
    synced += 1;
  }
  return synced;
}
