import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Campaign as PrismaCampaign } from "@novaris/database";
import { Campaign, type CampaignProps } from "../../domain/aggregates/campaign/campaign.js";

/** PrismaCampaignMapper — tradução pura Aggregate ↔ linha real do Postgres (via Prisma Client), sem I/O próprio. */
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

  static toDomain(record: PrismaCampaign): Campaign {
    const props: CampaignProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      name: record.name,
      startDate: record.startDate ?? undefined,
      endDate: record.endDate ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return Campaign.reconstitute(props, new UniqueEntityId(record.id));
  }
}
