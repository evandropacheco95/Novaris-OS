import { AggregateRoot, Result, ConflictError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

export type SyncRunStatus = "RUNNING" | "SUCCEEDED" | "FAILED";

/** `"API"` — sync ao vivo via `GoogleAdsProvider`. `"CSV_IMPORT"` — import manual de relatório exportado do Google Ads. */
export type SyncRunSource = "API" | "CSV_IMPORT";

export interface SyncRunProps {
  organizationId: UniqueEntityId;
  advertisingAccountId: UniqueEntityId;
  status: SyncRunStatus;
  source: SyncRunSource;
  sourceFileRecordId?: UniqueEntityId;
  startedAt: Date;
  finishedAt?: Date;
  errorMessage?: string;
  campaignsSynced: number;
  adGroupsSynced: number;
  keywordsSynced: number;
  searchTermsSynced: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSyncRunInput {
  organizationId: UniqueEntityId;
  advertisingAccountId: UniqueEntityId;
  /** @default "API" */
  source?: SyncRunSource;
  sourceFileRecordId?: UniqueEntityId;
}

export interface CompleteSyncRunInput {
  campaignsSynced: number;
  adGroupsSynced: number;
  keywordsSynced: number;
  searchTermsSynced: number;
}

/**
 * Rastreia cada execução de sincronização — sempre `INSERT`, nunca upsert
 * (`objects/SyncRun.md § 7`). Sem Domain Event próprio — os 2 eventos de
 * conclusão/falha de sincronização já existem em `AdvertisingAccount`
 * (`AdvertisingAccountSyncCompleted`/`AdvertisingAccountSyncFailed`),
 * `ADR-0060`.
 */
export class SyncRun extends AggregateRoot<SyncRunProps> implements Timestamped {
  private constructor(props: SyncRunProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateSyncRunInput): Result<SyncRun, DomainError> {
    const now = new Date();
    const props: SyncRunProps = {
      organizationId: input.organizationId,
      advertisingAccountId: input.advertisingAccountId,
      status: "RUNNING",
      source: input.source ?? "API",
      sourceFileRecordId: input.sourceFileRecordId,
      startedAt: now,
      campaignsSynced: 0,
      adGroupsSynced: 0,
      keywordsSynced: 0,
      searchTermsSynced: 0,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new SyncRun(props));
  }

  /** Usado exclusivamente por uma implementação de `SyncRunRepository` (ENS-0001 § 8). */
  static reconstitute(props: SyncRunProps, id: UniqueEntityId): SyncRun {
    return new SyncRun(props, id);
  }

  /** Transição terminal `RUNNING → SUCCEEDED`. */
  complete(input: CompleteSyncRunInput): Result<void, DomainError> {
    if (this.props.status !== "RUNNING") {
      return Result.fail(new ConflictError(`SyncRun não pode ser concluído a partir do estado "${this.props.status}"`));
    }
    this.props.status = "SUCCEEDED";
    this.props.finishedAt = new Date();
    this.props.campaignsSynced = input.campaignsSynced;
    this.props.adGroupsSynced = input.adGroupsSynced;
    this.props.keywordsSynced = input.keywordsSynced;
    this.props.searchTermsSynced = input.searchTermsSynced;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  /** Transição terminal `RUNNING → FAILED`. */
  fail(errorMessage: string): Result<void, DomainError> {
    if (this.props.status !== "RUNNING") {
      return Result.fail(new ConflictError(`SyncRun não pode ser marcado como falho a partir do estado "${this.props.status}"`));
    }
    this.props.status = "FAILED";
    this.props.finishedAt = new Date();
    this.props.errorMessage = errorMessage;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get advertisingAccountId(): UniqueEntityId {
    return this.props.advertisingAccountId;
  }

  get status(): SyncRunStatus {
    return this.props.status;
  }

  get source(): SyncRunSource {
    return this.props.source;
  }

  get sourceFileRecordId(): UniqueEntityId | undefined {
    return this.props.sourceFileRecordId;
  }

  get startedAt(): Date {
    return this.props.startedAt;
  }

  get finishedAt(): Date | undefined {
    return this.props.finishedAt;
  }

  get errorMessage(): string | undefined {
    return this.props.errorMessage;
  }

  get campaignsSynced(): number {
    return this.props.campaignsSynced;
  }

  get adGroupsSynced(): number {
    return this.props.adGroupsSynced;
  }

  get keywordsSynced(): number {
    return this.props.keywordsSynced;
  }

  get searchTermsSynced(): number {
    return this.props.searchTermsSynced;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
