/**
 * CreateUserCommand — Application Layer, Identity Domain.
 *
 * Mesmo padrão estrutural de `CreatePartyCommand` (Customer, `ENG-0125`):
 * classe imutável, campos primitivos, zero lógica. `createdBy` é o id do
 * usuário autenticado que está criando este novo `User` (nunca o próprio
 * usuário sendo criado — `User.create()` já torna isso estruturalmente
 * impossível, `user.ts`).
 */
export interface CreateUserCommandInput {
  readonly organizationId: string;
  readonly email: string;
  readonly createdBy: string;
}

export class CreateUserCommand {
  readonly organizationId: string;
  readonly email: string;
  readonly createdBy: string;

  constructor(input: CreateUserCommandInput) {
    this.organizationId = input.organizationId;
    this.email = input.email;
    this.createdBy = input.createdBy;
    Object.freeze(this);
  }
}
