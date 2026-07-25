import { Body, Controller, Get, HttpException, HttpStatus, Param, Put, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { SetFeatureFlagCommand, SetFeatureFlagHandler, GetFeatureFlagCommand, GetFeatureFlagHandler } from "@novaris/feature-flags";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface FeatureFlagResponse {
  key: string;
  enabled: boolean;
  updatedAt: string;
}

/**
 * FeatureFlagController — API de `feature-flags` (`ADR-0038`, `ENG-0140`).
 * `organizationId` sempre derivado do JWT, nunca aceito do corpo da
 * requisição.
 */
@Controller("feature-flags")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("system.feature-flags.manage")
export class FeatureFlagController {
  constructor(
    private readonly setHandler: SetFeatureFlagHandler,
    private readonly getHandler: GetFeatureFlagHandler,
  ) {}

  @Get(":key")
  async get(@Param("key") key: string, @Req() req: AuthenticatedRequest): Promise<FeatureFlagResponse | { key: string; enabled: false }> {
    const result = await this.getHandler.execute(new GetFeatureFlagCommand({ organizationId: req.user.organizationId, key }));
    if (result.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar feature flag" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = result.getValue()!;
    if (option.isNone) {
      return { key, enabled: false };
    }
    const flag = option.getOrElse(null as never);
    return { key: flag.key, enabled: flag.enabled, updatedAt: flag.updatedAt.toISOString() };
  }

  @Put(":key")
  async set(@Param("key") key: string, @Body() body: { enabled: boolean }, @Req() req: AuthenticatedRequest): Promise<FeatureFlagResponse> {
    const result = await this.setHandler.execute(new SetFeatureFlagCommand({ organizationId: req.user.organizationId, key, enabled: body.enabled }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    const flag = result.getValue()!;
    return { key: flag.key, enabled: flag.enabled, updatedAt: flag.updatedAt.toISOString() };
  }
}
