import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import {
  CreateQuotationCommand,
  CreateQuotationHandler,
  AddQuotationLineItemCommand,
  AddQuotationLineItemHandler,
  SendQuotationCommand,
  SendQuotationHandler,
  AcceptQuotationCommand,
  AcceptQuotationHandler,
  RejectQuotationCommand,
  RejectQuotationHandler,
  GenerateContractFromQuotationCommand,
  GenerateContractFromQuotationHandler,
  type QuotationRepository,
  type QuotationStatus,
} from "@novaris/sales";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";
import type { ContractResponse } from "./contract.controller.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface QuotationLineItemResponse {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface QuotationResponse {
  id: string;
  opportunityId: string;
  status: QuotationStatus;
  lineItems: QuotationLineItemResponse[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * QuotationController — API do `Quotation` (`ADR-0043`), preenche a lacuna
 * estrutural reservada desde `ADR-0020`, adaptado do Salesforce Quote.
 */
@Controller("quotations")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("sales.quotations.manage")
export class QuotationController {
  constructor(
    private readonly createHandler: CreateQuotationHandler,
    private readonly addLineItemHandler: AddQuotationLineItemHandler,
    private readonly sendHandler: SendQuotationHandler,
    private readonly acceptHandler: AcceptQuotationHandler,
    private readonly rejectHandler: RejectQuotationHandler,
    private readonly generateContractHandler: GenerateContractFromQuotationHandler,
    @Inject("QuotationRepository") private readonly repository: QuotationRepository,
  ) {}

  @Post()
  async create(@Body() body: { opportunityId: string }, @Req() req: AuthenticatedRequest): Promise<QuotationResponse> {
    const result = await this.createHandler.execute(
      new CreateQuotationCommand({ organizationId: req.user.organizationId, opportunityId: body.opportunityId }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<QuotationResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Quotations" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((quotation) => quotation.organizationId.toString() === req.user.organizationId)
      .map((quotation) => toResponse(quotation));
  }

  @Get(":id")
  async findById(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<QuotationResponse> {
    const quotation = await this.loadAndAssertOwnership(id, req.user);
    return toResponse(quotation);
  }

  @Post(":id/line-items")
  async addLineItem(
    @Param("id") id: string,
    @Body() body: { productId: string; quantity: number },
    @Req() req: AuthenticatedRequest,
  ): Promise<QuotationResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.addLineItemHandler.execute(
      new AddQuotationLineItemCommand({ quotationId: id, productId: body.productId, quantity: body.quantity }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Post(":id/send")
  async send(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<QuotationResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.sendHandler.execute(new SendQuotationCommand({ quotationId: id }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Post(":id/accept")
  async accept(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<QuotationResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.acceptHandler.execute(new AcceptQuotationCommand({ quotationId: id }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Post(":id/reject")
  async reject(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<QuotationResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.rejectHandler.execute(new RejectQuotationCommand({ quotationId: id }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  /** Gera um `Contract` real a partir desta Quotation (`ADR-0044`) — falha com 409 se ainda não `accepted`. */
  @Post(":id/generate-contract")
  async generateContract(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<ContractResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.generateContractHandler.execute(new GenerateContractFromQuotationCommand({ quotationId: id }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toContractResponse(result.getValue()!);
  }

  private async loadAndAssertOwnership(id: string, user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Quotation" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Quotation "${id}" não encontrada` });
    }
    const quotation = option.getOrElse(null as never);
    if (quotation.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Quotation "${id}" não encontrada` });
    }
    return quotation;
  }
}

function toResponse(quotation: {
  id: { toString(): string };
  opportunityId: { toString(): string };
  status: QuotationStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  getLineItems(): ReadonlyArray<{
    id: { toString(): string };
    productId: { toString(): string };
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}): QuotationResponse {
  return {
    id: quotation.id.toString(),
    opportunityId: quotation.opportunityId.toString(),
    status: quotation.status,
    lineItems: quotation.getLineItems().map((item) => ({
      id: item.id.toString(),
      productId: item.productId.toString(),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    total: quotation.total,
    createdAt: quotation.createdAt.toISOString(),
    updatedAt: quotation.updatedAt.toISOString(),
  };
}

function toContractResponse(contract: {
  id: { toString(): string };
  opportunityId: { toString(): string };
  quotationId: { toString(): string };
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): ContractResponse {
  return {
    id: contract.id.toString(),
    opportunityId: contract.opportunityId.toString(),
    quotationId: contract.quotationId.toString(),
    status: contract.status as ContractResponse["status"],
    createdAt: contract.createdAt.toISOString(),
    updatedAt: contract.updatedAt.toISOString(),
  };
}
