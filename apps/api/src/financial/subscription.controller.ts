import { Body, Controller, Get, HttpException, HttpStatus, Inject, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { CreateSubscriptionCommand, CreateSubscriptionHandler, type SubscriptionRepository } from "@novaris/financial";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface SubscriptionResponse {
  id: string;
  organizationId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/** SubscriptionController — API do Financial Domain (`ENG-0131`). Mesma receita de `InvoiceController`. */
@Controller("subscriptions")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("financial.subscriptions.manage")
export class SubscriptionController {
  constructor(
    private readonly createHandler: CreateSubscriptionHandler,
    @Inject("SubscriptionRepository") private readonly repository: SubscriptionRepository,
  ) {}

  @Post()
  async create(@Body() body: { name: string }, @Req() req: AuthenticatedRequest): Promise<SubscriptionResponse> {
    const command = new CreateSubscriptionCommand({ organizationId: req.user.organizationId, name: body.name });
    const result = await this.createHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<SubscriptionResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Subscriptions" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((subscription) => subscription.organizationId.toString() === req.user.organizationId)
      .map((subscription) => toResponse(subscription));
  }
}

function toResponse(subscription: {
  id: { toString(): string };
  organizationId: { toString(): string };
  name: string;
  createdAt: Date;
  updatedAt: Date;
}): SubscriptionResponse {
  return {
    id: subscription.id.toString(),
    organizationId: subscription.organizationId.toString(),
    name: subscription.name,
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString(),
  };
}
