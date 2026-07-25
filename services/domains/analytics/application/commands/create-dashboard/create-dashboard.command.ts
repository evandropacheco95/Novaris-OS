/** CreateDashboardCommand — Application Layer, Analytics Domain. */
export interface CreateDashboardCommandInput {
  readonly organizationId: string;
  readonly name: string;
}

export class CreateDashboardCommand {
  readonly organizationId: string;
  readonly name: string;

  constructor(input: CreateDashboardCommandInput) {
    this.organizationId = input.organizationId;
    this.name = input.name;
    Object.freeze(this);
  }
}
