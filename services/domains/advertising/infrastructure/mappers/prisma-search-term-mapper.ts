import { UniqueEntityId } from "@novaris/shared-kernel";
import type { SearchTerm as PrismaSearchTerm } from "@novaris/database";
import { SearchTerm, type SearchTermProps } from "../../domain/aggregates/search-term/search-term.js";

/** PrismaSearchTermMapper — tradução pura Aggregate ↔ linha do Postgres, sem I/O próprio. */
export class PrismaSearchTermMapper {
  static toPersistenceCreate(searchTerm: SearchTerm) {
    return {
      id: searchTerm.id.toString(),
      organizationId: searchTerm.organizationId.toString(),
      advertisingAccountId: searchTerm.advertisingAccountId.toString(),
      adGroupId: searchTerm.adGroupId.toString(),
      syncRunId: searchTerm.syncRunId.toString(),
      searchTerm: searchTerm.searchTerm,
      dateRangeStart: searchTerm.dateRangeStart,
      dateRangeEnd: searchTerm.dateRangeEnd,
      clicks: searchTerm.clicks,
      impressions: searchTerm.impressions,
      conversions: searchTerm.conversions,
      costMicros: BigInt(Math.trunc(searchTerm.costMicros)),
    };
  }

  static toDomain(record: PrismaSearchTerm): SearchTerm {
    const props: SearchTermProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      advertisingAccountId: new UniqueEntityId(record.advertisingAccountId),
      adGroupId: new UniqueEntityId(record.adGroupId),
      syncRunId: new UniqueEntityId(record.syncRunId),
      searchTerm: record.searchTerm,
      dateRangeStart: record.dateRangeStart,
      dateRangeEnd: record.dateRangeEnd,
      clicks: record.clicks,
      impressions: record.impressions,
      conversions: record.conversions,
      costMicros: Number(record.costMicros),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return SearchTerm.reconstitute(props, new UniqueEntityId(record.id));
  }
}
