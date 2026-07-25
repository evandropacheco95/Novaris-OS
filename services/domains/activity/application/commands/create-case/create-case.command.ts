import type { CasePriority } from "../../../domain/aggregates/case/case.js";

export interface CreateCaseCommandInput {
  readonly organizationId: string;
  readonly partyId: string;
  readonly subject: string;
  readonly description?: string;
  readonly priority: CasePriority;
}

export class CreateCaseCommand {
  readonly organizationId: string;
  readonly partyId: string;
  readonly subject: string;
  readonly description?: string;
  readonly priority: CasePriority;

  constructor(input: CreateCaseCommandInput) {
    this.organizationId = input.organizationId;
    this.partyId = input.partyId;
    this.subject = input.subject;
    this.description = input.description;
    this.priority = input.priority;
    Object.freeze(this);
  }
}
