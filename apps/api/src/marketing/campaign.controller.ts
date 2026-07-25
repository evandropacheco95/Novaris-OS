import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { CreateCampaignCommand, CreateCampaignHandler, AddAssetToCampaignCommand, AddAssetToCampaignHandler, type CampaignRepository } from "@novaris/marketing";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface AssetResponse {
  id: string;
  fileRecordId: string;
  addedAt: string;
}

export interface CampaignResponse {
  id: string;
  organizationId: string;
  name: string;
  startDate?: string;
  endDate?: string;
  assets: AssetResponse[];
  createdAt: string;
  updatedAt: string;
}

/**
 * CampaignController — API do Marketing Domain (`ENG-0133`), sexto domínio
 * de negócio exposto. Create + list (`Campaign` não tem mutador confirmado,
 * `ADR-0033`) + `POST /:id/assets` (associação com `FileRecord`, `ADR-0048`).
 */
@Controller("campaigns")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("marketing.campaigns.manage")
export class CampaignController {
  constructor(
    private readonly createHandler: CreateCampaignHandler,
    private readonly addAssetHandler: AddAssetToCampaignHandler,
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

  /** Associa um `FileRecord` já enviado (`POST /files`) a esta Campaign (`ADR-0048`). */
  @Post(":id/assets")
  async addAsset(
    @Param("id") id: string,
    @Body() body: { fileRecordId: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<CampaignResponse> {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Campaign" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Campaign "${id}" não encontrada` });
    }
    const campaign = option.getOrElse(null as never);
    if (campaign.organizationId.toString() !== req.user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Campaign "${id}" não encontrada` });
    }

    const result = await this.addAssetHandler.execute(new AddAssetToCampaignCommand({ campaignId: id, fileRecordId: body.fileRecordId }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
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
  getAssets(): ReadonlyArray<{ id: { toString(): string }; fileRecordId: { toString(): string }; addedAt: Date }>;
}): CampaignResponse {
  return {
    id: campaign.id.toString(),
    organizationId: campaign.organizationId.toString(),
    name: campaign.name,
    startDate: campaign.startDate?.toISOString(),
    endDate: campaign.endDate?.toISOString(),
    assets: campaign.getAssets().map((asset) => ({
      id: asset.id.toString(),
      fileRecordId: asset.fileRecordId.toString(),
      addedAt: asset.addedAt.toISOString(),
    })),
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
  };
}
