import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

/**
 * Espelha o estado atual de um grupo de anúncios do Google Ads — só config,
 * sem totais próprios (totais ficam em `AdCampaign`/`Keyword`). Object
 * Specification: `objects/AdGroup.md`.
 */
export interface AdGroupProps {
  organizationId: UniqueEntityId;
  advertisingAccountId: UniqueEntityId;
  adCampaignId: UniqueEntityId;
  externalAdGroupId: string;
  name: string;
  status: string;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAdGroupInput {
  organizationId: UniqueEntityId;
  advertisingAccountId: UniqueEntityId;
  adCampaignId: UniqueEntityId;
  externalAdGroupId: string;
  name: string;
  status: string;
}

export interface ApplyAdGroupSyncInput {
  name: string;
  status: string;
}

/**
 * Aggregate Root do Advertising Domain. Único por
 * `(advertisingAccountId, externalAdGroupId)`, mesmo padrão de resolução
 * criação-vs-`applySync()` de `AdCampaign`. Sem Domain Event, mesma
 * justificativa de `AdCampaign`.
 */
export class AdGroup extends AggregateRoot<AdGroupProps> implements Timestamped {
  private constructor(props: AdGroupProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateAdGroupInput): Result<AdGroup, DomainError> {
    if (input.externalAdGroupId.trim().length === 0) {
      return Result.fail(new ValidationError('"externalAdGroupId" é obrigatório'));
    }
    if (input.name.trim().length === 0) {
      return Result.fail(new ValidationError('"name" é obrigatório'));
    }

    const now = new Date();
    const props: AdGroupProps = {
      organizationId: input.organizationId,
      advertisingAccountId: input.advertisingAccountId,
      adCampaignId: input.adCampaignId,
      externalAdGroupId: input.externalAdGroupId,
      name: input.name,
      status: input.status,
      lastSyncedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new AdGroup(props));
  }

  /** Usado exclusivamente por uma implementação de `AdGroupRepository` (ENS-0001 § 8). */
  static reconstitute(props: AdGroupProps, id: UniqueEntityId): AdGroup {
    return new AdGroup(props, id);
  }

  applySync(input: ApplyAdGroupSyncInput): Result<void, DomainError> {
    this.props.name = input.name;
    this.props.status = input.status;
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

  get adCampaignId(): UniqueEntityId {
    return this.props.adCampaignId;
  }

  get externalAdGroupId(): string {
    return this.props.externalAdGroupId;
  }

  get name(): string {
    return this.props.name;
  }

  get status(): string {
    return this.props.status;
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
