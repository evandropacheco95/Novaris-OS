import type { LeadStatus } from "../../../domain/aggregates/lead/lead.js";

export interface UpdateLeadStatusCommandInput {
  readonly leadId: string;
  readonly status: Exclude<LeadStatus, "converted">;
}

export class UpdateLeadStatusCommand {
  readonly leadId: string;
  readonly status: Exclude<LeadStatus, "converted">;

  constructor(input: UpdateLeadStatusCommandInput) {
    this.leadId = input.leadId;
    this.status = input.status;
    Object.freeze(this);
  }
}
