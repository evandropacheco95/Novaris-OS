/** DisableUserCommand — Application Layer, Identity Domain. Mesmo padrão de `ActivateUserCommand`. */
export interface DisableUserCommandInput {
  readonly userId: string;
  readonly updatedBy: string;
}

export class DisableUserCommand {
  readonly userId: string;
  readonly updatedBy: string;

  constructor(input: DisableUserCommandInput) {
    this.userId = input.userId;
    this.updatedBy = input.updatedBy;
    Object.freeze(this);
  }
}
