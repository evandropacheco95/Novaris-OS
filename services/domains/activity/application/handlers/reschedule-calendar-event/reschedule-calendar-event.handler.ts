import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { CalendarEvent } from "../../../domain/aggregates/calendar-event/calendar-event.js";
import type { CalendarEventRepository } from "../../../domain/repositories/calendar-event-repository.js";
import type { RescheduleCalendarEventCommand } from "../../commands/reschedule-calendar-event/reschedule-calendar-event.command.js";

/** RescheduleCalendarEventHandler — Application Layer, Activity Domain (`ADR-0045`). */
export class RescheduleCalendarEventHandler {
  constructor(private readonly calendarEventRepository: CalendarEventRepository) {}

  async execute(command: RescheduleCalendarEventCommand): Promise<Result<CalendarEvent, DomainError | InfrastructureError>> {
    const findResult = await this.calendarEventRepository.findById(new UniqueEntityId(command.calendarEventId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`CalendarEvent "${command.calendarEventId}" não encontrado`));
    }
    const calendarEvent = option.getOrElse(null as never);

    const rescheduleResult = calendarEvent.reschedule(new Date(command.startAt), new Date(command.endAt));
    if (rescheduleResult.isFailure) {
      return Result.fail(rescheduleResult.getError()!);
    }

    const saveResult = await this.calendarEventRepository.save(calendarEvent);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(calendarEvent);
  }
}
