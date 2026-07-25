import { AggregateRoot, Result, ValidationError, ConflictError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";
import { InvoicePaid } from "../../events/invoice-paid.js";

/**
 * Invoice — Aggregate Root do Financial Domain.
 *
 * Traceability:
 * - [ADR-0027](../../../../../adr/ADR-0027-financial-invoice-subscription-aggregates.md) — confirmado Aggregate Root independente de `Subscription`
 * - [ADR-0031](../../../../../adr/ADR-0031-financial-minimum-fields.md) — `amount`/`currency`/`status`/`subscriptionId` como campos mínimos
 *
 * Único Aggregate desta engenharia com Domain Event confirmado desde a
 * primeira implementação (`InvoicePaid`, um dos 10 eventos oficiais,
 * `DOMAIN_MODEL.md § EVENT BUS`) — diferente de `Party`/`Project`, que não
 * têm nenhum evento confirmado.
 *
 * `Payment` não é implementado como objeto próprio (`ADR-0031`) — a
 * liquidação é representada diretamente por `markPaid()`, mesmo padrão de
 * `Opportunity.markWon()`/`markLost()` não exigirem um objeto "Resultado".
 */
export type InvoiceStatus = "pending" | "paid";

export interface InvoiceProps {
  organizationId: UniqueEntityId;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  subscriptionId?: UniqueEntityId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceInput {
  organizationId: UniqueEntityId;
  amount: number;
  currency: string;
  subscriptionId?: UniqueEntityId;
}

export class Invoice extends AggregateRoot<InvoiceProps> implements Timestamped {
  private constructor(props: InvoiceProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /** Único ponto de criação. Nasce sempre `"pending"` — `markPaid()` é a única transição possível. */
  static create(input: CreateInvoiceInput): Result<Invoice, DomainError> {
    if (input.amount <= 0) {
      return Result.fail(new ValidationError('"amount" deve ser maior que zero'));
    }
    if (input.currency.trim().length === 0) {
      return Result.fail(new ValidationError('"currency" é obrigatório'));
    }

    const now = new Date();
    const props: InvoiceProps = {
      organizationId: input.organizationId,
      amount: input.amount,
      currency: input.currency,
      status: "pending",
      subscriptionId: input.subscriptionId,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new Invoice(props));
  }

  /** Usado exclusivamente por uma implementação de `InvoiceRepository` (reconstituição). */
  static reconstitute(props: InvoiceProps, id: UniqueEntityId): Invoice {
    return new Invoice(props, id);
  }

  /** Transição `"pending"` → `"paid"` — única transição confirmada (`InvoicePaid`, `ADR-0031`). */
  markPaid(): Result<void, DomainError> {
    if (this.props.status !== "pending") {
      return Result.fail(new ConflictError(`Invoice no status "${this.props.status}" não pode ser marcada como paga — transição válida só a partir de "pending"`));
    }
    this.props.status = "paid";
    this.props.updatedAt = new Date();
    this.addDomainEvent(new InvoicePaid(this.id));
    return Result.ok(undefined);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get status(): InvoiceStatus {
    return this.props.status;
  }

  get subscriptionId(): UniqueEntityId | undefined {
    return this.props.subscriptionId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
