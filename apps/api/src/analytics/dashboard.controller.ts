import { Body, Controller, Get, HttpException, HttpStatus, Inject, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { CreateDashboardCommand, CreateDashboardHandler, type DashboardRepository } from "@novaris/analytics";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface DashboardResponse {
  id: string;
  organizationId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DashboardController — API do Analytics Domain (`ENG-0133`), sétimo e
 * último domínio de negócio exposto nesta engenharia. Mesma receita de
 * `SubscriptionController`/`CampaignController` (create + list apenas —
 * `Dashboard` não tem mutador confirmado, `ADR-0034`). `Widget` não é
 * exposto — bloqueado até um caso de uso real definir seus campos.
 */
@Controller("dashboards")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("analytics.dashboards.manage")
export class DashboardController {
  constructor(
    private readonly createHandler: CreateDashboardHandler,
    @Inject("DashboardRepository") private readonly repository: DashboardRepository,
  ) {}

  @Post()
  async create(@Body() body: { name: string }, @Req() req: AuthenticatedRequest): Promise<DashboardResponse> {
    const command = new CreateDashboardCommand({ organizationId: req.user.organizationId, name: body.name });
    const result = await this.createHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<DashboardResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Dashboards" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((dashboard) => dashboard.organizationId.toString() === req.user.organizationId)
      .map((dashboard) => toResponse(dashboard));
  }
}

function toResponse(dashboard: {
  id: { toString(): string };
  organizationId: { toString(): string };
  name: string;
  createdAt: Date;
  updatedAt: Date;
}): DashboardResponse {
  return {
    id: dashboard.id.toString(),
    organizationId: dashboard.organizationId.toString(),
    name: dashboard.name,
    createdAt: dashboard.createdAt.toISOString(),
    updatedAt: dashboard.updatedAt.toISOString(),
  };
}
