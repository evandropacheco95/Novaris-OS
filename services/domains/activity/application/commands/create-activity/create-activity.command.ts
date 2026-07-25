import type { ActivityType } from "../../../domain/aggregates/activity/activity.js";

/** CreateActivityCommand — Application Layer, Activity Domain. */
export interface CreateActivityCommandInput {
  readonly organizationId: string;
  readonly partyId: string;
  readonly type: ActivityType;
  readonly notes?: string;
}

export class CreateActivityCommand {
  readonly organizationId: string;
  readonly partyId: string;
  readonly type: ActivityType;
  readonly notes?: string;

  constructor(input: CreateActivityCommandInput) {
    this.organizationId = input.organizationId;
    this.partyId = input.partyId;
    this.type = input.type;
    this.notes = input.notes;
    Object.freeze(this);
  }
}
