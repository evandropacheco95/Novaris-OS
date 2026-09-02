import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

/**
 * Espelha o estado atual de uma campanha do Google Ads — config + últimos
 * totais, sem histórico (histórico é `PerformanceSnapshot`, Fase 03,
 * `ADR-0060`). Object Specification: `objects/AdCampaign.md`.
 */
export interface AdCampaignProps {
  organizationId: UniqueEntityId;
  advertisingAccountId: UniqueEntityId;
  externalCampaignId: string;
  name: string;
  status: string;
  channelType: string;
  lastCostMicros: number;
  lastClicks: number;
  lastImpressions: number;
  lastConversions: number;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAdCampaignInput {
  organizationId: UniqueEntityId;
  advertisingAccountId: UniqueEntityId;
  externalCampaignId: string;
  name: string;
  status: string;
  channelType: string;
  lastCostMicros: number;
  lastClicks: number;
  lastImpressions: number;
  lastConversions: number;
}

export interface ApplyAdCampaignSyncInput {
  name: string;
  status: string;
  channelType: string;
  lastCostMicros: number;
  lastClicks: number;
  lastImpressions: number;
  lastConversions: number;
}

/**
 * Aggregate Root do Advertising Domain. Único por
 * `(advertisingAccountId, externalCampaignId)` — a Application Layer
 * (`SyncAdvertisingAccountHandler`) resolve criação vs. `applySync()` via
 * `AdCampaignRepository.findByExternalCampaignId()`. Sem Domain Event —
 * nenhuma fonte confirma um consumidor para sincronização de espelho
 * (`objects/AdCampaign.md § 9`), mesmo critério de `Opportunity.advanceStage()`.
 */
export class AdCampaign extends AggregateRoot<AdCampaignProps> implements Timestamped {
  private constructor(props: AdCampaignProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateAdCampaignInput): Result<AdCampaign, DomainError> {
    if (input.externalCampaignId.trim().length === 0) {
      return Result.fail(new ValidationError('"externalCampaignId" é obrigatório'));
    }
    if (input.name.trim().length === 0) {
      return Result.fail(new ValidationError('"name" é obrigatório'));
    }

    const now = new Date();
    const props: AdCampaignProps = {
      organizationId: input.organizationId,
      advertisingAccountId: input.advertisingAccountId,
      externalCampaignId: input.externalCampaignId,
      name: input.name,
      status: input.status,
      channelType: input.channelType,
      lastCostMicros: input.lastCostMicros,
      lastClicks: input.lastClicks,
      lastImpressions: input.lastImpressions,
      lastConversions: input.lastConversions,
      lastSyncedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new AdCampaign(props));
  }

  /** Usado exclusivamente por uma implementação de `AdCampaignRepository` (ENS-0001 § 8). */
  static reconstitute(props: AdCampaignProps, id: UniqueEntityId): AdCampaign {
    return new AdCampaign(props, id);
  }

  /** Atualiza config + últimos totais a partir de uma nova sincronização — nunca soma, sempre substitui. */
  applySync(input: ApplyAdCampaignSyncInput): Result<void, DomainError> {
    this.props.name = input.name;
    this.props.status = input.status;
    this.props.channelType = input.channelType;
    this.props.lastCostMicros = input.lastCostMicros;
    this.props.lastClicks = input.lastClicks;
    this.props.lastImpressions = input.lastImpressions;
    this.props.lastConversions = input.lastConversions;
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

  get externalCampaignId(): string {
    return this.props.externalCampaignId;
  }

  get name(): string {
    return this.props.name;
  }

  get status(): string {
    return this.props.status;
  }

  get channelType(): string {
    return this.props.channelType;
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

  get lastConversions(): number {
    return this.props.lastConversions;
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
