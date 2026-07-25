import { Body, Controller, Get, HttpException, HttpStatus, Inject, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { CreateCampaignCommand, CreateCampaignHandler, type CampaignRepository } from "@novaris/marketing";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface CampaignResponse {
  id: string;
  organizationId: string;
  name: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * CampaignController — API do Marketing Domain (`ENG-0133`), sexto domínio
 * de negócio exposto. Mesma receita de `SubscriptionController` (create +
 * list apenas — `Campaign` não tem mutador confirmado, `ADR-0033`).
 */
@Controller("campaigns")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("marketing.campaigns.manage")
export class CampaignController {
  constructor(
    private readonly createHandler: CreateCampaignHandler,
    @Inject("CampaignRepository") private readonly repository: CampaignRepository,
  ) {}

  @Post()
  async create(
    @Body() body: { name: string; startDate?: string; endDate?: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<CampaignResponse> {
    const command = new CreateCampaignCommand({
      organizationId: req.user.organizationId,
      name: body.name,
      startDate: body.startDate,
      endDate: body.endDate,
    });
    const result = await this.createHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<CampaignResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Campaigns" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((campaign) => campaign.organizationId.toString() === req.user.organizationId)
      .map((campaign) => toResponse(campaign));
  }
}

function toResponse(campaign: {
  id: { toString(): string };
  organizationId: { toString(): string };
  name: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}): CampaignResponse {
  return {
    id: campaign.id.toString(),
    organizationId: campaign.organizationId.toString(),
    name: campaign.name,
    startDate: campaign.startDate?.toISOString(),
    endDate: campaign.endDate?.toISOString(),
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
  };
}
