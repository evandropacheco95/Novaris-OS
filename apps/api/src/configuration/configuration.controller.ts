import { Body, Controller, Get, HttpException, HttpStatus, Param, Put, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { SetConfigurationEntryCommand, SetConfigurationEntryHandler, GetConfigurationEntryCommand, GetConfigurationEntryHandler } from "@novaris/configuration";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface ConfigurationEntryResponse {
  key: string;
  value: string;
  updatedAt: string;
}

/**
 * ConfigurationController — API de `configuration` (`ADR-0038`, `ENG-0140`).
 * `organizationId` sempre derivado do JWT, nunca aceito do corpo da
 * requisição — mesmo isolamento de tenant reforçado em código já usado em
 * todo Controller desta API.
 */
@Controller("configuration")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("system.configuration.manage")
export class ConfigurationController {
  constructor(
    private readonly setHandler: SetConfigurationEntryHandler,
    private readonly getHandler: GetConfigurationEntryHandler,
  ) {}

  @Get(":key")
  async get(@Param("key") key: string, @Req() req: AuthenticatedRequest): Promise<ConfigurationEntryResponse | null> {
    const result = await this.getHandler.execute(new GetConfigurationEntryCommand({ organizationId: req.user.organizationId, key }));
    if (result.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar configuração" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = result.getValue()!;
    if (option.isNone) {
      return null;
    }
    const entry = option.getOrElse(null as never);
    return { key: entry.key, value: entry.value, updatedAt: entry.updatedAt.toISOString() };
  }

  @Put(":key")
  async set(@Param("key") key: string, @Body() body: { value: string }, @Req() req: AuthenticatedRequest): Promise<ConfigurationEntryResponse> {
    const result = await this.setHandler.execute(new SetConfigurationEntryCommand({ organizationId: req.user.organizationId, key, value: body.value }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    const entry = result.getValue()!;
    return { key: entry.key, value: entry.value, updatedAt: entry.updatedAt.toISOString() };
  }
}
