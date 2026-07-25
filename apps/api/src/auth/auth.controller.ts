import { Body, Controller, Post } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthenticateUserCommand, AuthenticateUserHandler } from "@novaris/identity";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";
import type { JwtPayload } from "./jwt-auth.guard.js";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    organizationId: string;
    email: string;
    status: string;
  };
}

/**
 * AuthController — `POST /auth/login`, primeiro endpoint de autenticação real
 * da NOVARIS (`ENG-0122`, Identity/Auth MVP). Orquestra:
 * `AuthenticateUserCommand` → `AuthenticateUserHandler` (Application, Identity
 * Domain) → `AuthenticationDomainService` (Domain) → `Result<User,
 * DomainError>` → emissão de JWT.
 *
 * Emissão de token vive aqui, não na Application Layer — mesma decisão já
 * registrada em `ADR-0010`: "Session/JWT... artefato criado depois de uma
 * autenticação bem-sucedida", responsabilidade da Composition Root, nunca do
 * Domain/Application (que nunca importam `@nestjs/jwt`).
 *
 * As 3 causas de falha de autenticação (email inexistente, usuário inativo,
 * senha incorreta) chegam aqui como o mesmo `AuthenticationError` — a mesma
 * mensagem genérica sai como HTTP 401, nunca distinguindo a causa (mesmo
 * princípio já documentado em `AuthenticationDomainService`).
 */
@Controller("auth")
export class AuthController {
  constructor(
    private readonly handler: AuthenticateUserHandler,
    private readonly jwtService: JwtService,
  ) {}

  @Post("login")
  async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    const command = new AuthenticateUserCommand({ email: body.email, password: body.password });
    const result = await this.handler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }

    const user = result.getValue()!;
    const payload: JwtPayload = {
      sub: user.id.toString(),
      organizationId: user.organizationId.toString(),
      email: user.email.value,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id.toString(),
        organizationId: user.organizationId.toString(),
        email: user.email.value,
        status: user.status,
      },
    };
  }
}
