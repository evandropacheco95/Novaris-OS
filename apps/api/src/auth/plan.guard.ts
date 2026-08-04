import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import type { OrganizationRepository } from "@novaris/organizations";
import { REQUIRED_DOMAIN_KEY } from "./require-domain.decorator.js";
import type { AuthenticatedUser } from "./jwt-auth.guard.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

/**
 * PlanGuard — aplica a restrição marcada por `@RequireDomain()` (`ENG-0164`
 * continuação). Roda **depois** de `JwtAuthGuard` (`@UseGuards(JwtAuthGuard,
 * PermissionGuard, PlanGuard)`) — depende de `request.user.organizationId`
 * já populado. Mesma disciplina de `PermissionGuard`: um Controller sem
 * `@RequireDomain()` não é afetado (`getAllAndOverride` devolve `undefined`,
 * `canActivate` libera a rota).
 *
 * `Organization.enabledDomains` indefinido/vazio = sem restrição (mesmo
 * comportamento já usado na sidebar do frontend, `useEnabledDomains`) —
 * preserva toda Organization existente antes desta missão. Organization não
 * encontrada no repositório também libera a rota (mesmo critério defensivo
 * de `CreateUserHandler.execute`, `ENG-0164`) — o JWT já garante que o
 * usuário foi autenticado contra uma Organization real; se o `findById` não
 * a encontrar aqui, é uma falha de infraestrutura, não uma decisão de plano,
 * e não deveria bloquear a operação por um motivo que não é dela.
 */
@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject("PLAN_GUARD_ORGANIZATION_REPOSITORY") private readonly organizationRepository: OrganizationRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const domainKey = this.reflector.getAllAndOverride<string | undefined>(REQUIRED_DOMAIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!domainKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const orgResult = await this.organizationRepository.findById(new UniqueEntityId(request.user.organizationId));
    if (orgResult.isFailure) {
      return true;
    }
    const orgOption = orgResult.getValue()!;
    if (orgOption.isNone) {
      return true;
    }

    const organization = orgOption.getOrElse(null as never);
    const enabledDomains = organization.enabledDomains;
    if (!enabledDomains || enabledDomains.length === 0) {
      return true;
    }
    if (!enabledDomains.includes(domainKey)) {
      throw new ForbiddenException({
        code: "PLAN_RESTRICTION_ERROR",
        message: `Domínio "${domainKey}" não está habilitado no plano desta Organization`,
      });
    }
    return true;
  }
}
