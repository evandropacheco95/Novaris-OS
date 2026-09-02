import { UniqueEntityId } from "@novaris/shared-kernel";
import type { AdGroup as PrismaAdGroup } from "@novaris/database";
import { AdGroup, type AdGroupProps } from "../../domain/aggregates/ad-group/ad-group.js";

/** PrismaAdGroupMapper — tradução pura Aggregate ↔ linha do Postgres, sem I/O próprio. */
export class PrismaAdGroupMapper {
  static toPersistenceCreate(adGroup: AdGroup) {
    return {
      id: adGroup.id.toString(),
      organizationId: adGroup.organizationId.toString(),
      advertisingAccountId: adGroup.advertisingAccountId.toString(),
      adCampaignId: adGroup.adCampaignId.toString(),
      externalAdGroupId: adGroup.externalAdGroupId,
      name: adGroup.name,
      status: adGroup.status,
      lastSyncedAt: adGroup.lastSyncedAt,
    };
  }

  static toDomain(record: PrismaAdGroup): AdGroup {
    const props: AdGroupProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      advertisingAccountId: new UniqueEntityId(record.advertisingAccountId),
      adCampaignId: new UniqueEntityId(record.adCampaignId),
      externalAdGroupId: record.externalAdGroupId,
      name: record.name,
      status: record.status,
      lastSyncedAt: record.lastSyncedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return AdGroup.reconstitute(props, new UniqueEntityId(record.id));
  }
}
