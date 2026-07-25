/** RevokePermissionCommand — Application Layer, Identity Domain. Mesmo padrão de `GrantPermissionCommand`. */
export interface RevokePermissionCommandInput {
  readonly roleId: string;
  readonly permissionCode: string;
  readonly updatedBy: string;
}

export class RevokePermissionCommand {
  readonly roleId: string;
  readonly permissionCode: string;
  readonly updatedBy: string;

  constructor(input: RevokePermissionCommandInput) {
    this.roleId = input.roleId;
    this.permissionCode = input.permissionCode;
    this.updatedBy = input.updatedBy;
    Object.freeze(this);
  }
}
