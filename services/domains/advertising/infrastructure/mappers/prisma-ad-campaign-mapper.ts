import { UniqueEntityId } from "@novaris/shared-kernel";
import type { AdCampaign as PrismaAdCampaign } from "@novaris/database";
import { AdCampaign, type AdCampaignProps } from "../../domain/aggregates/ad-campaign/ad-campaign.js";

/** PrismaAdCampaignMapper — tradução pura Aggregate ↔ linha do Postgres, sem I/O próprio. Mesmo padrão de `PrismaAdvertisingAccountMapper`. */
export class PrismaAdCampaignMapper {
  static toPersistenceCreate(adCampaign: AdCampaign) {
    return {
      id: adCampaign.id.toString(),
      organizationId: adCampaign.organizationId.toString(),
      advertisingAccountId: adCampaign.advertisingAccountId.toString(),
      externalCampaignId: adCampaign.externalCampaignId,
      name: adCampaign.name,
      status: adCampaign.status,
      channelType: adCampaign.channelType,
      lastCostMicros: BigInt(Math.trunc(adCampaign.lastCostMicros)),
      lastClicks: adCampaign.lastClicks,
      lastImpressions: adCampaign.lastImpressions,
      lastConversions: adCampaign.lastConversions,
      lastSyncedAt: adCampaign.lastSyncedAt,
    };
  }

  static toDomain(record: PrismaAdCampaign): AdCampaign {
    const props: AdCampaignProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      advertisingAccountId: new UniqueEntityId(record.advertisingAccountId),
      externalCampaignId: record.externalCampaignId,
      name: record.name,
      status: record.status,
      channelType: record.channelType,
      lastCostMicros: Number(record.lastCostMicros),
      lastClicks: record.lastClicks,
      lastImpressions: record.lastImpressions,
      lastConversions: record.lastConversions,
      lastSyncedAt: record.lastSyncedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return AdCampaign.reconstitute(props, new UniqueEntityId(record.id));
  }
}
