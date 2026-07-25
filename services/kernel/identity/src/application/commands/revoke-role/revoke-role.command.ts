/** RevokeRoleCommand — Application Layer, Identity Domain. */
export interface RevokeRoleCommandInput {
  readonly userId: string;
  readonly roleId: string;
  readonly updatedBy: string;
}

export class RevokeRoleCommand {
  readonly userId: string;
  readonly roleId: string;
  readonly updatedBy: string;

  constructor(input: RevokeRoleCommandInput) {
    this.userId = input.userId;
    this.roleId = input.roleId;
    this.updatedBy = input.updatedBy;
    Object.freeze(this);
  }
}
