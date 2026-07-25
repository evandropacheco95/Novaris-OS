import { AggregateRoot, Result, ValidationError, ConflictError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

/**
 * Reminder — Aggregate Root do Activity Domain (`ADR-0045`), adaptado do
 * Salesforce Reminder. Sem Domain Event — nenhuma fonte confirma um.
 */

export interface ReminderProps {
  organizationId: UniqueEntityId;
  partyId: UniqueEntityId;
  message: string;
  remindAt: Date;
  dismissed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReminderInput {
  organizationId: UniqueEntityId;
  partyId: UniqueEntityId;
  message: string;
  remindAt: Date;
}

export class Reminder extends AggregateRoot<ReminderProps> implements Timestamped {
  private constructor(props: ReminderProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /** Único ponto de criação. Nasce sempre `dismissed: false`. */
  static create(input: CreateReminderInput): Result<Reminder, DomainError> {
    if (!input.message || input.message.trim().length === 0) {
      return Result.fail(new ValidationError('"message" é obrigatório'));
    }
    const now = new Date();
    const props: ReminderProps = {
      organizationId: input.organizationId,
      partyId: input.partyId,
      message: input.message,
      remindAt: input.remindAt,
      dismissed: false,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new Reminder(props));
  }

  static reconstitute(props: ReminderProps, id: UniqueEntityId): Reminder {
    return new Reminder(props, id);
  }

  /** Transição terminal `false → true`. */
  dismiss(): Result<void, DomainError> {
    if (this.props.dismissed) {
      return Result.fail(new ConflictError("Reminder já foi dispensado"));
    }
    this.props.dismissed = true;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get partyId(): UniqueEntityId {
    return this.props.partyId;
  }

  get message(): string {
    return this.props.message;
  }

  get remindAt(): Date {
    return this.props.remindAt;
  }

  get dismissed(): boolean {
    return this.props.dismissed;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
