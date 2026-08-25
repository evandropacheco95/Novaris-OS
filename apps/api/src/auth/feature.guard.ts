import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import type { FeatureFlagRepository } from "@novaris/feature-flags";
import { REQUIRED_FEATURE_KEY } from "./require-feature.decorator.js";
import type { AuthenticatedUser } from "./jwt-auth.guard.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

/**
 * FeatureGuard — aplica a restrição marcada por `@RequireFeature()` (`ADR-0056`),
 * fechando o gap que `ADR-0038` deixou explicitamente em aberto ("um futuro
 * `PermissionGuard`-equivalente para features"). Roda depois de `JwtAuthGuard`
 * (`@UseGuards(JwtAuthGuard, PermissionGuard, FeatureGuard)`) — depende de
 * `request.user.organizationId` já populado. Um método sem `@RequireFeature()`
 * não é afetado (`getAllAndOverride` devolve `undefined`, `canActivate` libera).
 *
 * **Semântica invertida em relação a `PlanGuard`/`enabledDomains`**: ausência
 * de `FeatureFlag` = desabilitado por padrão (opt-in), não "sem restrição" —
 * `enabledDomains` foi retrofit sobre Organizations que já tinham acesso a
 * tudo; um gate de feature novo, aplicado a uma rota opcional/avançada sem
 * uso real ainda, começa fechado com segurança.
 */
@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject("FEATURE_GUARD_FEATURE_FLAG_REPOSITORY") private readonly featureFlagRepository: FeatureFlagRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const featureKey = this.reflector.getAllAndOverride<string | undefined>(REQUIRED_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!featureKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const flagResult = await this.featureFlagRepository.findByOrganizationAndKey(
      new UniqueEntityId(request.user.organizationId),
      featureKey,
    );
    if (flagResult.isFailure) {
      return true;
    }
    const flagOption = flagResult.getValue()!;
    if (flagOption.isNone) {
      throw new ForbiddenException({
        code: "FEATURE_RESTRICTION_ERROR",
        message: `Feature "${featureKey}" não está habilitada para esta Organization`,
      });
    }

    const flag = flagOption.getOrElse(null as never);
    if (!flag.enabled) {
      throw new ForbiddenException({
        code: "FEATURE_RESTRICTION_ERROR",
        message: `Feature "${featureKey}" não está habilitada para esta Organization`,
      });
    }
    return true;
  }
}
