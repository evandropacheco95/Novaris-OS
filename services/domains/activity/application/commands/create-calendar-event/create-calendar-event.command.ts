export interface CreateCalendarEventCommandInput {
  readonly organizationId: string;
  readonly partyId: string;
  readonly subject: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly location?: string;
}

export class CreateCalendarEventCommand {
  readonly organizationId: string;
  readonly partyId: string;
  readonly subject: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly location?: string;

  constructor(input: CreateCalendarEventCommandInput) {
    this.organizationId = input.organizationId;
    this.partyId = input.partyId;
    this.subject = input.subject;
    this.startAt = input.startAt;
    this.endAt = input.endAt;
    this.location = input.location;
    Object.freeze(this);
  }
}
