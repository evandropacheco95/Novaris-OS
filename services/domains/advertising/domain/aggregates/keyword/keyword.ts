import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

/**
 * Espelha o estado atual de uma keyword do Google Ads — config + últimos
 * totais, distinta de `Search Term` (`objects/Keyword.md § Relação com Outros Módulos`).
 */
export interface KeywordProps {
  organizationId: UniqueEntityId;
  advertisingAccountId: UniqueEntityId;
  adGroupId: UniqueEntityId;
  externalCriterionId: string;
  text: string;
  matchType: string;
  status: string;
  qualityScore?: number;
  lastCostMicros: number;
  lastClicks: number;
  lastImpressions: number;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateKeywordInput {
  organizationId: UniqueEntityId;
  advertisingAccountId: UniqueEntityId;
  adGroupId: UniqueEntityId;
  externalCriterionId: string;
  text: string;
  matchType: string;
  status: string;
  qualityScore?: number;
  lastCostMicros: number;
  lastClicks: number;
  lastImpressions: number;
}

export interface ApplyKeywordSyncInput {
  text: string;
  matchType: string;
  status: string;
  qualityScore?: number;
  lastCostMicros: number;
  lastClicks: number;
  lastImpressions: number;
}

function validateQualityScore(qualityScore: number | undefined): ValidationError | undefined {
  if (qualityScore !== undefined && (qualityScore < 1 || qualityScore > 10)) {
    return new ValidationError(`"qualityScore" deve estar entre 1 e 10, recebido: ${qualityScore}`);
  }
  return undefined;
}

/**
 * Aggregate Root do Advertising Domain. Único por
 * `(advertisingAccountId, externalCriterionId)`, mesmo padrão de resolução
 * de `AdCampaign`/`AdGroup`. Sem Domain Event, mesma justificativa.
 */
export class Keyword extends AggregateRoot<KeywordProps> implements Timestamped {
  private constructor(props: KeywordProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateKeywordInput): Result<Keyword, DomainError> {
    if (input.externalCriterionId.trim().length === 0) {
      return Result.fail(new ValidationError('"externalCriterionId" é obrigatório'));
    }
    if (input.text.trim().length === 0) {
      return Result.fail(new ValidationError('"text" é obrigatório'));
    }
    const qualityScoreError = validateQualityScore(input.qualityScore);
    if (qualityScoreError) {
      return Result.fail(qualityScoreError);
    }

    const now = new Date();
    const props: KeywordProps = {
      organizationId: input.organizationId,
      advertisingAccountId: input.advertisingAccountId,
      adGroupId: input.adGroupId,
      externalCriterionId: input.externalCriterionId,
      text: input.text,
      matchType: input.matchType,
      status: input.status,
      qualityScore: input.qualityScore,
      lastCostMicros: input.lastCostMicros,
      lastClicks: input.lastClicks,
      lastImpressions: input.lastImpressions,
      lastSyncedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new Keyword(props));
  }

  /** Usado exclusivamente por uma implementação de `KeywordRepository` (ENS-0001 § 8). */
  static reconstitute(props: KeywordProps, id: UniqueEntityId): Keyword {
    return new Keyword(props, id);
  }

  applySync(input: ApplyKeywordSyncInput): Result<void, DomainError> {
    const qualityScoreError = validateQualityScore(input.qualityScore);
    if (qualityScoreError) {
      return Result.fail(qualityScoreError);
    }

    this.props.text = input.text;
    this.props.matchType = input.matchType;
    this.props.status = input.status;
    this.props.qualityScore = input.qualityScore;
    this.props.lastCostMicros = input.lastCostMicros;
    this.props.lastClicks = input.lastClicks;
    this.props.lastImpressions = input.lastImpressions;
    this.props.lastSyncedAt = new Date();
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get advertisingAccountId(): UniqueEntityId {
    return this.props.advertisingAccountId;
  }

  get adGroupId(): UniqueEntityId {
    return this.props.adGroupId;
  }

  get externalCriterionId(): string {
    return this.props.externalCriterionId;
  }

  get text(): string {
    return this.props.text;
  }

  get matchType(): string {
    return this.props.matchType;
  }

  get status(): string {
    return this.props.status;
  }

  get qualityScore(): number | undefined {
    return this.props.qualityScore;
  }

  get lastCostMicros(): number {
    return this.props.lastCostMicros;
  }

  get lastClicks(): number {
    return this.props.lastClicks;
  }

  get lastImpressions(): number {
    return this.props.lastImpressions;
  }

  get lastSyncedAt(): Date {
    return this.props.lastSyncedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
