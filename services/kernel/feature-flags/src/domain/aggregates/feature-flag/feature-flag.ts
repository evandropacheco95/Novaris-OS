import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError } from "@novaris/shared-kernel";

/**
 * FeatureFlag — Aggregate Root do Kernel `feature-flags` (Fase C,
 * `ADR-0038`). Par chave/booleano genérico por organização — sem catálogo
 * fechado de chaves. Unicidade de `(organizationId, key)` garantida pelo
 * Repository (upsert), não pelo Aggregate isoladamente.
 */
export interface FeatureFlagProps {
  organizationId: UniqueEntityId;
  key: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFeatureFlagInput {
  organizationId: UniqueEntityId;
  key: string;
  enabled: boolean;
}

export class FeatureFlag extends AggregateRoot<FeatureFlagProps> {
  private constructor(props: FeatureFlagProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateFeatureFlagInput): Result<FeatureFlag, DomainError> {
    if (input.key.trim().length === 0) {
      return Result.fail(new ValidationError('"key" não pode ser vazio'));
    }
    const now = new Date();
    return Result.ok(
      new FeatureFlag({
        organizationId: input.organizationId,
        key: input.key,
        enabled: input.enabled,
        createdAt: now,
        updatedAt: now,
      }),
    );
  }

  static reconstitute(props: FeatureFlagProps, id: UniqueEntityId): FeatureFlag {
    return new FeatureFlag(props, id);
  }

  setEnabled(enabled: boolean): void {
    this.props.enabled = enabled;
    this.props.updatedAt = new Date();
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get key(): string {
    return this.props.key;
  }

  get enabled(): boolean {
    return this.props.enabled;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
