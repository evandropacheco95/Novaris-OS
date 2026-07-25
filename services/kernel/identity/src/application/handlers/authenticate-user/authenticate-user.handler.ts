import { Result } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { User } from "../../../domain/aggregates/user/user.js";
import { Email } from "../../../domain/value-objects/email.js";
import type { AuthenticationDomainService } from "../../../domain/services/authentication/authentication-domain-service.js";
import type { AuthenticateUserCommand } from "../../commands/authenticate-user/authenticate-user.command.js";

/**
 * AuthenticateUserHandler — Application Layer, Identity Domain.
 *
 * Orquestra: `AuthenticateUserCommand` → `Email.create()` (conversão
 * `string` → Value Object, única lógica própria do Handler, mesmo padrão de
 * `string` → `UniqueEntityId` já usado pelos Handlers de Sales) →
 * `AuthenticationDomainService.execute()` → `Result<User, DomainError | InfrastructureError>`
 * (assinatura corrigida em consolidação — o Domain Service já podia devolver
 * `InfrastructureError` via `UserRepository`, tipo antes declarado mais
 * estreito do que o valor real devolvido).
 *
 * Se `Email.create()` falhar (formato inválido), o `ValidationError` é
 * devolvido diretamente — nunca chega a invocar o Domain Service. Nenhuma
 * lógica de autenticação própria: localizar `User`, checar `status`, verificar
 * senha são inteiramente responsabilidade de `AuthenticationDomainService`
 * (já implementado, `ENG-0002.10B`/`ADR-0010`). Não emite JWT nem qualquer
 * outro artefato pós-autenticação — isso é responsabilidade da Composition
 * Root (`apps/api`), nunca da Application Layer (mesmo raciocínio já registrado
 * em `ADR-0010`: "Session/JWT... artefato criado depois de uma autenticação
 * bem-sucedida, não um mecanismo de verificação de identidade em si").
 */
export class AuthenticateUserHandler {
  constructor(private readonly authenticationDomainService: AuthenticationDomainService) {}

  async execute(command: AuthenticateUserCommand): Promise<Result<User, DomainError | InfrastructureError>> {
    const emailResult = Email.create(command.email);
    if (emailResult.isFailure) {
      return Result.fail(emailResult.getError()!);
    }

    return this.authenticationDomainService.execute({
      email: emailResult.getValue()!,
      password: command.password,
    });
  }
}
