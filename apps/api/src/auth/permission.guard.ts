import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { AuthorizationDomainService } from "@novaris/identity";
import { REQUIRED_PERMISSION_KEY } from "./require-permission.decorator.js";
import type { AuthenticatedUser } from "./jwt-auth.guard.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

/**
 * PermissionGuard — aplica a `Permission` marcada por `@RequirePermission()`
 * (`ADR-0036`). Roda **depois** de `JwtAuthGuard` (`@UseGuards(JwtAuthGuard,
 * PermissionGuard)`) — depende de `request.user.userId` já populado.
 *
 * Reaproveita `AuthorizationDomainService` (Identity Domain) sem alterá-lo —
 * este Guard é só a fronteira HTTP que traduz `Result<boolean>` em `403`.
 * Um Controller sem `@RequirePermission()` não é afetado por este Guard
 * (`getAllAndOverride` devolve `undefined`, `canActivate` libera a rota) —
 * hoje isso só se aplica a `AuthController`, que nem usa este Guard.
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationDomainService: AuthorizationDomainService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionCode = this.reflector.getAllAndOverride<string | undefined>(REQUIRED_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!permissionCode) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const result = await this.authorizationDomainService.execute({
      userId: new UniqueEntityId(request.user.userId),
      permissionCode,
    });

    if (result.isFailure) {
      throw new ForbiddenException({ code: "AUTHORIZATION_ERROR", message: "Falha ao verificar permissão" });
    }
    if (result.getValue() !== true) {
      throw new ForbiddenException({ code: "AUTHORIZATION_ERROR", message: `Permissão "${permissionCode}" necessária` });
    }
    return true;
  }
}
