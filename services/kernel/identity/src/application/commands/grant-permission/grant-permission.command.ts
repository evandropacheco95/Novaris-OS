/** GrantPermissionCommand — Application Layer, Identity Domain. */
export interface GrantPermissionCommandInput {
  readonly roleId: string;
  readonly permissionCode: string;
  readonly updatedBy: string;
}

export class GrantPermissionCommand {
  readonly roleId: string;
  readonly permissionCode: string;
  readonly updatedBy: string;

  constructor(input: GrantPermissionCommandInput) {
    this.roleId = input.roleId;
    this.permissionCode = input.permissionCode;
    this.updatedBy = input.updatedBy;
    Object.freeze(this);
  }
}
