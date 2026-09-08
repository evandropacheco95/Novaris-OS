import { UniqueEntityId } from "@novaris/shared-kernel";
import type { SyncRun as PrismaSyncRun } from "@novaris/database";
import { SyncRun, type SyncRunProps, type SyncRunStatus, type SyncRunSource } from "../../domain/aggregates/sync-run/sync-run.js";

/** PrismaSyncRunMapper — tradução pura Aggregate ↔ linha do Postgres, sem I/O próprio. */
export class PrismaSyncRunMapper {
  static toPersistenceCreate(syncRun: SyncRun) {
    return {
      id: syncRun.id.toString(),
      organizationId: syncRun.organizationId.toString(),
      advertisingAccountId: syncRun.advertisingAccountId.toString(),
      status: syncRun.status,
      source: syncRun.source,
      sourceFileRecordId: syncRun.sourceFileRecordId?.toString() ?? null,
      startedAt: syncRun.startedAt,
      finishedAt: syncRun.finishedAt ?? null,
      errorMessage: syncRun.errorMessage ?? null,
      campaignsSynced: syncRun.campaignsSynced,
      adGroupsSynced: syncRun.adGroupsSynced,
      keywordsSynced: syncRun.keywordsSynced,
      searchTermsSynced: syncRun.searchTermsSynced,
    };
  }

  static toDomain(record: PrismaSyncRun): SyncRun {
    const props: SyncRunProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      advertisingAccountId: new UniqueEntityId(record.advertisingAccountId),
      status: record.status as SyncRunStatus,
      source: record.source as SyncRunSource,
      sourceFileRecordId: record.sourceFileRecordId ? new UniqueEntityId(record.sourceFileRecordId) : undefined,
      startedAt: record.startedAt,
      finishedAt: record.finishedAt ?? undefined,
      errorMessage: record.errorMessage ?? undefined,
      campaignsSynced: record.campaignsSynced,
      adGroupsSynced: record.adGroupsSynced,
      keywordsSynced: record.keywordsSynced,
      searchTermsSynced: record.searchTermsSynced,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return SyncRun.reconstitute(props, new UniqueEntityId(record.id));
  }
}
