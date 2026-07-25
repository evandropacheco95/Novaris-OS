import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Campaign as PrismaCampaign, CampaignAsset as PrismaCampaignAsset } from "@novaris/database";
import { Campaign, type CampaignProps } from "../../domain/aggregates/campaign/campaign.js";
import { Asset, type AssetProps } from "../../domain/entities/asset/asset.js";

type PrismaCampaignWithAssets = PrismaCampaign & { assets: PrismaCampaignAsset[] };

/**
 * PrismaCampaignMapper — tradução pura Aggregate ↔ linha real do Postgres
 * (via Prisma Client), sem I/O próprio. Reconstitui a coleção `assets`
 * (tabela própria, `campaign_assets`) — mesmo tratamento de
 * `PrismaQuotationMapper` para `lineItems` (`ADR-0048`).
 */
export class PrismaCampaignMapper {
  static toPersistenceCreate(campaign: Campaign) {
    return {
      id: campaign.id.toString(),
      organizationId: campaign.organizationId.toString(),
      name: campaign.name,
      startDate: campaign.startDate ?? null,
      endDate: campaign.endDate ?? null,
    };
  }

  static toDomain(record: PrismaCampaignWithAssets): Campaign {
    const assets = record.assets.map((assetRecord) => {
      const props: AssetProps = {
        fileRecordId: new UniqueEntityId(assetRecord.fileRecordId),
        addedAt: assetRecord.addedAt,
      };
      return Asset.reconstitute(props, new UniqueEntityId(assetRecord.id));
    });

    const props: CampaignProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      name: record.name,
      startDate: record.startDate ?? undefined,
      endDate: record.endDate ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return Campaign.reconstitute(props, new UniqueEntityId(record.id), assets);
  }
}
