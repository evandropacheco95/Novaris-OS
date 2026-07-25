import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

/**
 * Subscription — Aggregate Root do Financial Domain.
 *
 * Traceability:
 * - [ADR-0027](../../../../../adr/ADR-0027-financial-invoice-subscription-aggregates.md) — confirmado Aggregate Root independente de `Invoice`; posse reafirmada como Financial (`ENG-0011` item 7)
 * - [ADR-0031](../../../../../adr/ADR-0031-financial-minimum-fields.md) — `name` como único campo mínimo
 *
 * Sem Domain Event — nenhum `SubscriptionCreated`/`SubscriptionCancelled` está
 * na lista oficial de 10 eventos (`DOMAIN_MODEL.md § EVENT BUS`). Sem campo
 * de status — nenhuma fonte confirma estados (`ADR-0031`, diferente de
 * `Task`, que tinha estados reais em `BOM.md`).
 *
 * `Invoice` referencia `Subscription` por id (`Invoice.subscriptionId?`),
 * nunca o inverso — `Subscription` não guarda coleção de `Invoice`s.
 */
export interface SubscriptionProps {
  organizationId: UniqueEntityId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionInput {
  organizationId: UniqueEntityId;
  name: string;
}

export class Subscription extends AggregateRoot<SubscriptionProps> implements Timestamped {
  private constructor(props: SubscriptionProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateSubscriptionInput): Result<Subscription, DomainError> {
    if (input.name.trim().length === 0) {
      return Result.fail(new ValidationError('"name" é obrigatório'));
    }

    const now = new Date();
    const props: SubscriptionProps = {
      organizationId: input.organizationId,
      name: input.name,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new Subscription(props));
  }

  /** Usado exclusivamente por uma implementação de `SubscriptionRepository` (reconstituição). */
  static reconstitute(props: SubscriptionProps, id: UniqueEntityId): Subscription {
    return new Subscription(props, id);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
