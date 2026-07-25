import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError } from "@novaris/shared-kernel";

/**
 * ConfigurationEntry — Aggregate Root do Kernel `configuration` (Fase C,
 * `ADR-0038`). Par chave/valor genérico por organização — sem catálogo
 * fechado de chaves (nenhuma fonte oficial define quais configurações
 * existem). Unicidade de `(organizationId, key)` garantida pelo Repository
 * (upsert), não pelo Aggregate isoladamente.
 */
export interface ConfigurationEntryProps {
  organizationId: UniqueEntityId;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConfigurationEntryInput {
  organizationId: UniqueEntityId;
  key: string;
  value: string;
}

export class ConfigurationEntry extends AggregateRoot<ConfigurationEntryProps> {
  private constructor(props: ConfigurationEntryProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateConfigurationEntryInput): Result<ConfigurationEntry, DomainError> {
    if (input.key.trim().length === 0) {
      return Result.fail(new ValidationError('"key" não pode ser vazio'));
    }
    const now = new Date();
    return Result.ok(
      new ConfigurationEntry({
        organizationId: input.organizationId,
        key: input.key,
        value: input.value,
        createdAt: now,
        updatedAt: now,
      }),
    );
  }

  static reconstitute(props: ConfigurationEntryProps, id: UniqueEntityId): ConfigurationEntry {
    return new ConfigurationEntry(props, id);
  }

  updateValue(value: string): void {
    this.props.value = value;
    this.props.updatedAt = new Date();
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get key(): string {
    return this.props.key;
  }

  get value(): string {
    return this.props.value;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
