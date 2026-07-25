import { Body, Controller, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import {
  CreateLeadCommand,
  CreateLeadHandler,
  UpdateLeadStatusCommand,
  UpdateLeadStatusHandler,
  ConvertLeadCommand,
  ConvertLeadHandler,
  type LeadRepository,
  type LeadStatus,
} from "@novaris/sales";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface LeadResponse {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status: LeadStatus;
  convertedPartyId?: string;
  convertedOpportunityId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * LeadController — API do `Lead` (`ADR-0042`, `ENG-0143`), adaptado do
 * Lead-to-Convert do Salesforce. `POST /leads/:id/convert` é a primeira rota
 * desta API a orquestrar 2 Business Domains numa única operação (Sales →
 * Customer, via `ConvertLeadHandler`).
 */
@Controller("leads")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("sales.leads.manage")
export class LeadController {
  constructor(
    private readonly createHandler: CreateLeadHandler,
    private readonly updateStatusHandler: UpdateLeadStatusHandler,
    private readonly convertHandler: ConvertLeadHandler,
    @Inject("LeadRepository") private readonly repository: LeadRepository,
  ) {}

  @Post()
  async create(
    @Body() body: { name: string; email?: string; phone?: string; company?: string; source?: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<LeadResponse> {
    const result = await this.createHandler.execute(
      new CreateLeadCommand({
        organizationId: req.user.organizationId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        source: body.source,
      }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<LeadResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Leads" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((lead) => lead.organizationId.toString() === req.user.organizationId)
      .map((lead) => toResponse(lead));
  }

  @Post(":id/status")
  async updateStatus(@Param("id") id: string, @Body() body: { status: Exclude<LeadStatus, "converted"> }): Promise<LeadResponse> {
    const result = await this.updateStatusHandler.execute(new UpdateLeadStatusCommand({ leadId: id, status: body.status }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Post(":id/convert")
  async convert(
    @Param("id") id: string,
    @Body() body: { partyType: string; createOpportunity?: boolean; pipelineId?: string; currentStageId?: string },
  ): Promise<LeadResponse> {
    const result = await this.convertHandler.execute(
      new ConvertLeadCommand({
        leadId: id,
        partyType: body.partyType,
        createOpportunity: body.createOpportunity,
        pipelineId: body.pipelineId,
        currentStageId: body.currentStageId,
      }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }
}

function toResponse(lead: {
  id: { toString(): string };
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status: LeadStatus;
  convertedPartyId?: { toString(): string };
  convertedOpportunityId?: { toString(): string };
  createdAt: Date;
  updatedAt: Date;
}): LeadResponse {
  return {
    id: lead.id.toString(),
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    source: lead.source,
    status: lead.status,
    convertedPartyId: lead.convertedPartyId?.toString(),
    convertedOpportunityId: lead.convertedOpportunityId?.toString(),
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}
