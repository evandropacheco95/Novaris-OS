import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

/**
 * CalendarEvent — Aggregate Root do Activity Domain (`ADR-0045`), adaptado
 * do Salesforce Event. Resolve o bloqueio registrado em
 * `ACTIVITY_AGGREGATE_DESIGN.md § 9` (sem entrada em BOM.md até esta ADR).
 * Sem status/lifecycle além de `reschedule()` — cancelamento é `delete()`
 * (Repository), não um estado inventado. Sem recorrência (RRULE) — sem
 * evidência de necessidade. Sem Domain Event — nenhuma fonte confirma um.
 */

export interface CalendarEventProps {
  organizationId: UniqueEntityId;
  partyId: UniqueEntityId;
  subject: string;
  startAt: Date;
  endAt: Date;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCalendarEventInput {
  organizationId: UniqueEntityId;
  partyId: UniqueEntityId;
  subject: string;
  startAt: Date;
  endAt: Date;
  location?: string;
}

export class CalendarEvent extends AggregateRoot<CalendarEventProps> implements Timestamped {
  private constructor(props: CalendarEventProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateCalendarEventInput): Result<CalendarEvent, DomainError> {
    if (!input.subject || input.subject.trim().length === 0) {
      return Result.fail(new ValidationError('"subject" é obrigatório'));
    }
    if (input.endAt.getTime() < input.startAt.getTime()) {
      return Result.fail(new ValidationError('"endAt" não pode ser anterior a "startAt"'));
    }
    const now = new Date();
    const props: CalendarEventProps = {
      organizationId: input.organizationId,
      partyId: input.partyId,
      subject: input.subject,
      startAt: input.startAt,
      endAt: input.endAt,
      location: input.location,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new CalendarEvent(props));
  }

  static reconstitute(props: CalendarEventProps, id: UniqueEntityId): CalendarEvent {
    return new CalendarEvent(props, id);
  }

  reschedule(startAt: Date, endAt: Date): Result<void, DomainError> {
    if (endAt.getTime() < startAt.getTime()) {
      return Result.fail(new ValidationError('"endAt" não pode ser anterior a "startAt"'));
    }
    this.props.startAt = startAt;
    this.props.endAt = endAt;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get partyId(): UniqueEntityId {
    return this.props.partyId;
  }

  get subject(): string {
    return this.props.subject;
  }

  get startAt(): Date {
    return this.props.startAt;
  }

  get endAt(): Date {
    return this.props.endAt;
  }

  get location(): string | undefined {
    return this.props.location;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
