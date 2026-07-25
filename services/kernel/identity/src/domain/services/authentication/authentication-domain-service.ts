import { Result, AuthenticationError } from "@novaris/shared-kernel";
import type { AsyncDomainService, DomainServiceResult } from "@novaris/shared-kernel";
import type { UserRepository } from "../../repositories/user-repository.js";
import type { User } from "../../aggregates/user/user.js";
import type { Email } from "../../value-objects/email.js";
import type { PasswordVerifier } from "./password-verifier.js";

export interface VerifyCredentialsInput {
  email: Email;
  password: string;
}

/**
 * Coordena a autenticação por credencial do Identity Domain — aprovado em
 * [DOMAIN_SERVICE_IDENTIFICATION.md § 5](../../../../DOMAIN_SERVICE_IDENTIFICATION.md)
 * (R4 + R11), assinatura congelada em `IDENTITY_TECHNICAL_BLUEPRINT.md §§ 4, 10`,
 * mecanismo de credencial resolvido em [ADR-0010](../../../../../../../adr/ADR-0010-authentication-credential-strategy.md).
 *
 * Ordem do fluxo é a mesma já congelada no Blueprint § 10: localizar `User`
 * por email → confirmar `status === "active"` → verificar senha via
 * `PasswordVerifier`. As 3 falhas de domínio (usuário inexistente, usuário
 * desativado, senha incorreta) devolvem exatamente a mesma `AuthenticationError`
 * — nenhuma distingue a causa, para não vazar qual delas ocorreu.
 *
 * Sem Factory Method (ENS-0003 § 6) — não tem identidade nem ciclo de vida
 * persistido; construtor público recebe as dependências diretamente.
 */
export class AuthenticationDomainService implements AsyncDomainService<VerifyCredentialsInput, User> {
  private static readonly INVALID_CREDENTIALS_MESSAGE = "credenciais inválidas";

  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordVerifier: PasswordVerifier,
  ) {}

  async execute(input: VerifyCredentialsInput): Promise<DomainServiceResult<User>> {
    const usersResult = await this.userRepository.findAll();
    if (usersResult.isFailure) {
      return Result.fail(usersResult.getError()!);
    }

    const user = usersResult.getValue()!.find((candidate) => candidate.email.equals(input.email));
    if (!user) {
      return Result.fail(new AuthenticationError(AuthenticationDomainService.INVALID_CREDENTIALS_MESSAGE));
    }

    if (user.status !== "active") {
      return Result.fail(new AuthenticationError(AuthenticationDomainService.INVALID_CREDENTIALS_MESSAGE));
    }

    const verificationResult = await this.passwordVerifier.verify(input.email, input.password);
    if (verificationResult.isFailure) {
      return Result.fail(verificationResult.getError()!);
    }

    if (!verificationResult.getValue()) {
      return Result.fail(new AuthenticationError(AuthenticationDomainService.INVALID_CREDENTIALS_MESSAGE));
    }

    return Result.ok(user);
  }
}
