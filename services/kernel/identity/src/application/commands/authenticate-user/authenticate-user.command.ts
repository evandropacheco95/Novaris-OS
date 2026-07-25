/**
 * AuthenticateUserCommand — Application Layer, Identity Domain.
 *
 * Representa a intenção "autenticar com este email e esta senha" — nenhuma
 * execução, nenhum acesso à Domain Layer. Mesmo padrão estrutural dos
 * Commands do Sales Domain (`CreateOpportunityCommand`, `ENG-0059`): classe
 * imutável, campos primitivos, zero lógica.
 *
 * `password` chega em texto claro até este ponto de fronteira (mesmo já
 * documentado em `ADR-0010`: "a senha chega em texto claro só neste ponto de
 * fronteira, nunca antes nem depois") — nunca logada, nunca persistida por
 * este Command.
 *
 * Imutável: todo campo `readonly` (tempo de compilação) + `Object.freeze()`
 * (tempo de execução).
 */
export interface AuthenticateUserCommandInput {
  readonly email: string;
  readonly password: string;
}

export class AuthenticateUserCommand {
  readonly email: string;
  readonly password: string;

  constructor(input: AuthenticateUserCommandInput) {
    this.email = input.email;
    this.password = input.password;
    Object.freeze(this);
  }
}
