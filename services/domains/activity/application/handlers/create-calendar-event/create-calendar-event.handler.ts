import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { CalendarEvent } from "../../../domain/aggregates/calendar-event/calendar-event.js";
import type { CalendarEventRepository } from "../../../domain/repositories/calendar-event-repository.js";
import type { CreateCalendarEventCommand } from "../../commands/create-calendar-event/create-calendar-event.command.js";

/** CreateCalendarEventHandler — Application Layer, Activity Domain (`ADR-0045`). */
export class CreateCalendarEventHandler {
  constructor(private readonly calendarEventRepository: CalendarEventRepository) {}

  async execute(command: CreateCalendarEventCommand): Promise<Result<CalendarEvent, DomainError | InfrastructureError>> {
    const createResult = CalendarEvent.create({
      organizationId: new UniqueEntityId(command.organizationId),
      partyId: new UniqueEntityId(command.partyId),
      subject: command.subject,
      startAt: new Date(command.startAt),
      endAt: new Date(command.endAt),
      location: command.location,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const calendarEvent = createResult.getValue()!;

    const saveResult = await this.calendarEventRepository.save(calendarEvent);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(calendarEvent);
  }
}
