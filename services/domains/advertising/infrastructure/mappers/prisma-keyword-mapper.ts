import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Keyword as PrismaKeyword } from "@novaris/database";
import { Keyword, type KeywordProps } from "../../domain/aggregates/keyword/keyword.js";

/** PrismaKeywordMapper — tradução pura Aggregate ↔ linha do Postgres, sem I/O próprio. */
export class PrismaKeywordMapper {
  static toPersistenceCreate(keyword: Keyword) {
    return {
      id: keyword.id.toString(),
      organizationId: keyword.organizationId.toString(),
      advertisingAccountId: keyword.advertisingAccountId.toString(),
      adGroupId: keyword.adGroupId.toString(),
      externalCriterionId: keyword.externalCriterionId,
      text: keyword.text,
      matchType: keyword.matchType,
      status: keyword.status,
      qualityScore: keyword.qualityScore ?? null,
      lastCostMicros: BigInt(Math.trunc(keyword.lastCostMicros)),
      lastClicks: keyword.lastClicks,
      lastImpressions: keyword.lastImpressions,
      lastSyncedAt: keyword.lastSyncedAt,
    };
  }

  static toDomain(record: PrismaKeyword): Keyword {
    const props: KeywordProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      advertisingAccountId: new UniqueEntityId(record.advertisingAccountId),
      adGroupId: new UniqueEntityId(record.adGroupId),
      externalCriterionId: record.externalCriterionId,
      text: record.text,
      matchType: record.matchType,
      status: record.status,
      qualityScore: record.qualityScore ?? undefined,
      lastCostMicros: Number(record.lastCostMicros),
      lastClicks: record.lastClicks,
      lastImpressions: record.lastImpressions,
      lastSyncedAt: record.lastSyncedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return Keyword.reconstitute(props, new UniqueEntityId(record.id));
  }
}
