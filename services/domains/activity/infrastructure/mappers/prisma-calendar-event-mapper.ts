import { UniqueEntityId } from "@novaris/shared-kernel";
import type { CalendarEvent as PrismaCalendarEvent } from "@novaris/database";
import { CalendarEvent, type CalendarEventProps } from "../../domain/aggregates/calendar-event/calendar-event.js";

/** PrismaCalendarEventMapper — tradução direta Aggregate ↔ Prisma. */
export class PrismaCalendarEventMapper {
  static toDomain(record: PrismaCalendarEvent): CalendarEvent {
    const props: CalendarEventProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      partyId: new UniqueEntityId(record.partyId),
      subject: record.subject,
      startAt: record.startAt,
      endAt: record.endAt,
      location: record.location ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return CalendarEvent.reconstitute(props, new UniqueEntityId(record.id));
  }

  static toPersistence(calendarEvent: CalendarEvent): PrismaCalendarEvent {
    return {
      id: calendarEvent.id.toString(),
      organizationId: calendarEvent.organizationId.toString(),
      partyId: calendarEvent.partyId.toString(),
      subject: calendarEvent.subject,
      startAt: calendarEvent.startAt,
      endAt: calendarEvent.endAt,
      location: calendarEvent.location ?? null,
      createdAt: calendarEvent.createdAt,
      updatedAt: calendarEvent.updatedAt,
    };
  }
}
