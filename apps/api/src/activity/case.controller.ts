import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import {
  CreateCaseCommand,
  CreateCaseHandler,
  StartCaseCommand,
  StartCaseHandler,
  CloseCaseCommand,
  CloseCaseHandler,
  type CaseRepository,
  type CaseStatus,
  type CasePriority,
} from "@novaris/activity";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface CaseResponse {
  id: string;
  partyId: string;
  subject: string;
  description?: string;
  status: CaseStatus;
  priority: CasePriority;
  createdAt: string;
  updatedAt: string;
}

/** CaseController — API do `Case` (`ADR-0043`), Activity Domain, adaptado do Salesforce Service Cloud. */
@Controller("cases")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("activity.cases.manage")
export class CaseController {
  constructor(
    private readonly createHandler: CreateCaseHandler,
    private readonly startHandler: StartCaseHandler,
    private readonly closeHandler: CloseCaseHandler,
    @Inject("CaseRepository") private readonly repository: CaseRepository,
  ) {}

  @Post()
  async create(
    @Body() body: { partyId: string; subject: string; description?: string; priority: CasePriority },
    @Req() req: AuthenticatedRequest,
  ): Promise<CaseResponse> {
    const result = await this.createHandler.execute(
      new CreateCaseCommand({
        organizationId: req.user.organizationId,
        partyId: body.partyId,
        subject: body.subject,
        description: body.description,
        priority: body.priority,
      }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<CaseResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Cases" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((caseInstance) => caseInstance.organizationId.toString() === req.user.organizationId)
      .map((caseInstance) => toResponse(caseInstance));
  }

  @Get(":id")
  async findById(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<CaseResponse> {
    const caseInstance = await this.loadAndAssertOwnership(id, req.user);
    return toResponse(caseInstance);
  }

  @Post(":id/start")
  async start(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<CaseResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.startHandler.execute(new StartCaseCommand({ caseId: id }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Post(":id/close")
  async close(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<CaseResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.closeHandler.execute(new CloseCaseCommand({ caseId: id }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  private async loadAndAssertOwnership(id: string, user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Case" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Case "${id}" não encontrado` });
    }
    const caseInstance = option.getOrElse(null as never);
    if (caseInstance.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Case "${id}" não encontrado` });
    }
    return caseInstance;
  }
}

function toResponse(caseInstance: {
  id: { toString(): string };
  partyId: { toString(): string };
  subject: string;
  description?: string;
  status: CaseStatus;
  priority: CasePriority;
  createdAt: Date;
  updatedAt: Date;
}): CaseResponse {
  return {
    id: caseInstance.id.toString(),
    partyId: caseInstance.partyId.toString(),
    subject: caseInstance.subject,
    description: caseInstance.description,
    status: caseInstance.status,
    priority: caseInstance.priority,
    createdAt: caseInstance.createdAt.toISOString(),
    updatedAt: caseInstance.updatedAt.toISOString(),
  };
}
