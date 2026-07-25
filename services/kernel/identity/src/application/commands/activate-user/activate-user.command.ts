/** ActivateUserCommand — Application Layer, Identity Domain. Mesmo padrão de `CreateUserCommand`. */
export interface ActivateUserCommandInput {
  readonly userId: string;
  readonly updatedBy: string;
}

export class ActivateUserCommand {
  readonly userId: string;
  readonly updatedBy: string;

  constructor(input: ActivateUserCommandInput) {
    this.userId = input.userId;
    this.updatedBy = input.updatedBy;
    Object.freeze(this);
  }
}
