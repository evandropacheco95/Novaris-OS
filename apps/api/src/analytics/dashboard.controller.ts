import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import {
  CreateDashboardCommand,
  CreateDashboardHandler,
  AddWidgetToDashboardCommand,
  AddWidgetToDashboardHandler,
  type DashboardRepository,
  type WidgetType,
} from "@novaris/analytics";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface WidgetResponse {
  id: string;
  type: WidgetType;
  title: string;
  metricKey: string;
}

export interface DashboardResponse {
  id: string;
  organizationId: string;
  name: string;
  widgets: WidgetResponse[];
  createdAt: string;
  updatedAt: string;
}

/**
 * DashboardController — API do Analytics Domain (`ENG-0133`). Create + list
 * (`Dashboard` não tem mutador confirmado, `ADR-0034`) + `POST /:id/widgets`
 * (configuração de exibição, `ADR-0049`).
 */
@Controller("dashboards")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("analytics.dashboards.manage")
export class DashboardController {
  constructor(
    private readonly createHandler: CreateDashboardHandler,
    private readonly addWidgetHandler: AddWidgetToDashboardHandler,
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

  /** Adiciona um Widget de configuração de exibição a este Dashboard (`ADR-0049`). */
  @Post(":id/widgets")
  async addWidget(
    @Param("id") id: string,
    @Body() body: { type: WidgetType; title: string; metricKey: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<DashboardResponse> {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Dashboard" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Dashboard "${id}" não encontrado` });
    }
    const dashboard = option.getOrElse(null as never);
    if (dashboard.organizationId.toString() !== req.user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Dashboard "${id}" não encontrado` });
    }

    const result = await this.addWidgetHandler.execute(
      new AddWidgetToDashboardCommand({ dashboardId: id, type: body.type, title: body.title, metricKey: body.metricKey }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }
}

function toResponse(dashboard: {
  id: { toString(): string };
  organizationId: { toString(): string };
  name: string;
  createdAt: Date;
  updatedAt: Date;
  getWidgets(): ReadonlyArray<{ id: { toString(): string }; type: WidgetType; title: string; metricKey: string }>;
}): DashboardResponse {
  return {
    id: dashboard.id.toString(),
    organizationId: dashboard.organizationId.toString(),
    name: dashboard.name,
    widgets: dashboard.getWidgets().map((widget) => ({
      id: widget.id.toString(),
      type: widget.type,
      title: widget.title,
      metricKey: widget.metricKey,
    })),
    createdAt: dashboard.createdAt.toISOString(),
    updatedAt: dashboard.updatedAt.toISOString(),
  };
}
