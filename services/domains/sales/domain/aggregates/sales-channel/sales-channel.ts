import { AggregateRoot, Result, ValidationError, ConflictError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

/**
 * SalesChannel — Aggregate Root do Sales Domain (`ADR-0052`), mesma forma
 * estrutural de `Pipeline` (`ADR-0021`) — Configuration Aggregate, mutação
 * rara, referenciado por id por `Opportunity`, nunca embutido. Sem Domain
 * Event, mesmo critério de `Pipeline`/`Product` (nenhuma fonte nomeia
 * evento de canal).
 *
 * Os 4 tipos são exatamente os confirmados pelo CTO — nenhum tipo adicional
 * inventado. Não modela preço/custo por canal (`ADR-0052 § Consequences`).
 */

export type SalesChannelType = "direct" | "distributor" | "marketplace" | "online_store";

const VALID_SALES_CHANNEL_TYPES: readonly SalesChannelType[] = ["direct", "distributor", "marketplace", "online_store"];

export interface SalesChannelProps {
  organizationId: UniqueEntityId;
  name: string;
  type: SalesChannelType;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSalesChannelInput {
  organizationId: UniqueEntityId;
  name: string;
  type: SalesChannelType;
}

export class SalesChannel extends AggregateRoot<SalesChannelProps> implements Timestamped {
  private constructor(props: SalesChannelProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /** Único ponto de criação. Nasce sempre `active: true`, mesmo padrão de `Product`. */
  static create(input: CreateSalesChannelInput): Result<SalesChannel, DomainError> {
    if (!input.name || input.name.trim().length === 0) {
      return Result.fail(new ValidationError('"name" é obrigatório'));
    }
    if (!VALID_SALES_CHANNEL_TYPES.includes(input.type)) {
      return Result.fail(new ValidationError(`"type" inválido: "${input.type}" — valores aceitos: ${VALID_SALES_CHANNEL_TYPES.join(", ")}`));
    }
    const now = new Date();
    const props: SalesChannelProps = {
      organizationId: input.organizationId,
      name: input.name,
      type: input.type,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new SalesChannel(props));
  }

  static reconstitute(props: SalesChannelProps, id: UniqueEntityId): SalesChannel {
    return new SalesChannel(props, id);
  }

  rename(name: string): Result<void, DomainError> {
    if (name.trim().length === 0) {
      return Result.fail(new ValidationError('"name" é obrigatório'));
    }
    this.props.name = name;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  deactivate(): Result<void, DomainError> {
    if (!this.props.active) {
      return Result.fail(new ConflictError("SalesChannel já está inativo"));
    }
    this.props.active = false;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  activate(): Result<void, DomainError> {
    if (this.props.active) {
      return Result.fail(new ConflictError("SalesChannel já está ativo"));
    }
    this.props.active = true;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): SalesChannelType {
    return this.props.type;
  }

  get active(): boolean {
    return this.props.active;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
