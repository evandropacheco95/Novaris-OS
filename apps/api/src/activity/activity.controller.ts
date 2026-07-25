import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { CreateActivityCommand, CreateActivityHandler, CompleteActivityCommand, CompleteActivityHandler, type ActivityRepository, type ActivityType } from "@novaris/activity";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface ActivityResponse {
  id: string;
  organizationId: string;
  partyId: string;
  type: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * ActivityController — API do Activity Domain (`ENG-0133`), quinto domínio
 * de negócio exposto, mesma receita já provada em `InvoiceController`
 * (Financial) e `ProjectController` (Project).
 */
@Controller("activities")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("activity.activities.manage")
export class ActivityController {
  constructor(
    private readonly createHandler: CreateActivityHandler,
    private readonly completeHandler: CompleteActivityHandler,
    @Inject("ActivityRepository") private readonly repository: ActivityRepository,
  ) {}

  @Post()
  async create(
    @Body() body: { partyId: string; type: ActivityType; notes?: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<ActivityResponse> {
    const command = new CreateActivityCommand({
      organizationId: req.user.organizationId,
      partyId: body.partyId,
      type: body.type,
      notes: body.notes,
    });
    const result = await this.createHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<ActivityResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Activities" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((activity) => activity.organizationId.toString() === req.user.organizationId)
      .map((activity) => toResponse(activity));
  }

  @Get(":id")
  async findById(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<ActivityResponse> {
    const activity = await this.loadAndAssertOwnership(id, req.user);
    return toResponse(activity);
  }

  @Post(":id/complete")
  async complete(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<ActivityResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const command = new CompleteActivityCommand({ activityId: id });
    const result = await this.completeHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  private async loadAndAssertOwnership(id: string, user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Activity" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Activity "${id}" não encontrada` });
    }
    const activity = option.getOrElse(null as never);
    if (activity.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Activity "${id}" não encontrada` });
    }
    return activity;
  }
}

function toResponse(activity: {
  id: { toString(): string };
  organizationId: { toString(): string };
  partyId: { toString(): string };
  type: string;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}): ActivityResponse {
  return {
    id: activity.id.toString(),
    organizationId: activity.organizationId.toString(),
    partyId: activity.partyId.toString(),
    type: activity.type,
    status: activity.status,
    notes: activity.notes,
    createdAt: activity.createdAt.toISOString(),
    updatedAt: activity.updatedAt.toISOString(),
  };
}
