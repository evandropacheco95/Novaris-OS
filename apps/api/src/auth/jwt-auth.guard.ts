import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

/** Claims do JWT emitido por `AuthController.login()` — `sub` é `User.id`. */
export interface JwtPayload {
  sub: string;
  organizationId: string;
  email: string;
}

/** Forma anexada a `request.user` após o Guard validar o token. */
export interface AuthenticatedUser {
  userId: string;
  organizationId: string;
  email: string;
}

/**
 * JwtAuthGuard — protege qualquer rota com `@UseGuards(JwtAuthGuard)`. Exige
 * header `Authorization: Bearer <token>`, valida assinatura/expiração via
 * `JwtService` (segredo `JWT_SECRET`, `apps/api/.env`), e anexa
 * `AuthenticatedUser` a `request.user` para o Controller usar (ex.:
 * `OpportunityController.loadAndAssertOwnership`).
 *
 * Não verifica `Permission`/`Role` — só confirma "este token é válido e
 * pertence a um usuário autenticado". Autorização granular por permissão
 * (`AuthorizationDomainService`, já implementado no Identity Domain) fica
 * para uma fase futura (`ENG-0122` é Auth MVP: autenticação, não RBAC
 * completo em toda rota — escopo explicitamente registrado, não esquecido).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException({ code: "AUTHENTICATION_ERROR", message: "Token ausente" });
    }

    const token = authHeader.slice("Bearer ".length);

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      request.user = { userId: payload.sub, organizationId: payload.organizationId, email: payload.email };
      return true;
    } catch {
      throw new UnauthorizedException({ code: "AUTHENTICATION_ERROR", message: "Token inválido ou expirado" });
    }
  }
}
