/** AssignRoleCommand — Application Layer, Identity Domain. */
export interface AssignRoleCommandInput {
  readonly userId: string;
  readonly roleId: string;
  readonly assignedBy: string;
}

export class AssignRoleCommand {
  readonly userId: string;
  readonly roleId: string;
  readonly assignedBy: string;

  constructor(input: AssignRoleCommandInput) {
    this.userId = input.userId;
    this.roleId = input.roleId;
    this.assignedBy = input.assignedBy;
    Object.freeze(this);
  }
}
