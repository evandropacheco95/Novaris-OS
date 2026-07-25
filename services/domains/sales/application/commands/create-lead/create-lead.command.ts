export interface CreateLeadCommandInput {
  readonly organizationId: string;
  readonly name: string;
  readonly email?: string;
  readonly phone?: string;
  readonly company?: string;
  readonly source?: string;
}

export class CreateLeadCommand {
  readonly organizationId: string;
  readonly name: string;
  readonly email?: string;
  readonly phone?: string;
  readonly company?: string;
  readonly source?: string;

  constructor(input: CreateLeadCommandInput) {
    this.organizationId = input.organizationId;
    this.name = input.name;
    this.email = input.email;
    this.phone = input.phone;
    this.company = input.company;
    this.source = input.source;
    Object.freeze(this);
  }
}
