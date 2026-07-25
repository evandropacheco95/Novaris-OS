/** CreateRoleCommand — Application Layer, Identity Domain. */
export interface CreateRoleCommandInput {
  readonly organizationId: string;
  readonly name: string;
  readonly createdBy: string;
}

export class CreateRoleCommand {
  readonly organizationId: string;
  readonly name: string;
  readonly createdBy: string;

  constructor(input: CreateRoleCommandInput) {
    this.organizationId = input.organizationId;
    this.name = input.name;
    this.createdBy = input.createdBy;
    Object.freeze(this);
  }
}
