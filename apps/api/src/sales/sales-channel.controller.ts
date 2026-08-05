import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import {
  CreateSalesChannelCommand,
  CreateSalesChannelHandler,
  RenameSalesChannelCommand,
  RenameSalesChannelHandler,
  ActivateSalesChannelCommand,
  ActivateSalesChannelHandler,
  DeactivateSalesChannelCommand,
  DeactivateSalesChannelHandler,
  type SalesChannelRepository,
  type SalesChannelType,
} from "@novaris/sales";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { PlanGuard } from "../auth/plan.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { RequireDomain } from "../auth/require-domain.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface SalesChannelResponse {
  id: string;
  name: string;
  type: SalesChannelType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** SalesChannelController — API do `SalesChannel` (`ADR-0052`), Sales Domain. Canal de venda como conceito de 1ª classe, referência real: Winnet (`ENG-0166`). */
@Controller("sales-channels")
@UseGuards(JwtAuthGuard, PermissionGuard, PlanGuard)
@RequirePermission("sales.sales-channels.manage")
@RequireDomain("Sales")
export class SalesChannelController {
  constructor(
    private readonly createHandler: CreateSalesChannelHandler,
    private readonly renameHandler: RenameSalesChannelHandler,
    private readonly activateHandler: ActivateSalesChannelHandler,
    private readonly deactivateHandler: DeactivateSalesChannelHandler,
    @Inject("SalesChannelRepository") private readonly repository: SalesChannelRepository,
  ) {}

  @Post()
  async create(@Body() body: { name: string; type: SalesChannelType }, @Req() req: AuthenticatedRequest): Promise<SalesChannelResponse> {
    const result = await this.createHandler.execute(
      new CreateSalesChannelCommand({ organizationId: req.user.organizationId, name: body.name, type: body.type }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<SalesChannelResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar SalesChannels" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((salesChannel) => salesChannel.organizationId.toString() === req.user.organizationId)
      .map((salesChannel) => toResponse(salesChannel));
  }

  @Patch(":id")
  async rename(@Param("id") id: string, @Body() body: { name: string }, @Req() req: AuthenticatedRequest): Promise<SalesChannelResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.renameHandler.execute(new RenameSalesChannelCommand({ salesChannelId: id, name: body.name }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Post(":id/activate")
  async activate(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<SalesChannelResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.activateHandler.execute(new ActivateSalesChannelCommand({ salesChannelId: id }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Post(":id/deactivate")
  async deactivate(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<SalesChannelResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.deactivateHandler.execute(new DeactivateSalesChannelCommand({ salesChannelId: id }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  private async loadAndAssertOwnership(id: string, user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar SalesChannel" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `SalesChannel "${id}" não encontrado` });
    }
    const salesChannel = option.getOrElse(null as never);
    if (salesChannel.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `SalesChannel "${id}" não encontrado` });
    }
    return salesChannel;
  }
}

function toResponse(salesChannel: {
  id: { toString(): string };
  name: string;
  type: SalesChannelType;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): SalesChannelResponse {
  return {
    id: salesChannel.id.toString(),
    name: salesChannel.name,
    type: salesChannel.type,
    active: salesChannel.active,
    createdAt: salesChannel.createdAt.toISOString(),
    updatedAt: salesChannel.updatedAt.toISOString(),
  };
}
