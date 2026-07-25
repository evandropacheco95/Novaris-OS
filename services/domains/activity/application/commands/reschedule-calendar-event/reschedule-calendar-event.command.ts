export interface RescheduleCalendarEventCommandInput {
  readonly calendarEventId: string;
  readonly startAt: string;
  readonly endAt: string;
}

export class RescheduleCalendarEventCommand {
  readonly calendarEventId: string;
  readonly startAt: string;
  readonly endAt: string;

  constructor(input: RescheduleCalendarEventCommandInput) {
    this.calendarEventId = input.calendarEventId;
    this.startAt = input.startAt;
    this.endAt = input.endAt;
    Object.freeze(this);
  }
}
