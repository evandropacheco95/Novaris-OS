import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { CreateInvoiceCommand, CreateInvoiceHandler, MarkInvoicePaidCommand, MarkInvoicePaidHandler, type InvoiceRepository } from "@novaris/financial";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface InvoiceResponse {
  id: string;
  organizationId: string;
  amount: number;
  currency: string;
  status: string;
  subscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * InvoiceController — API do Financial Domain (`ENG-0131`), quarto domínio
 * de negócio exposto, mesma receita já provada em `PartyController`
 * (Customer) e `ProjectController` (Project).
 */
@Controller("invoices")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("financial.invoices.manage")
export class InvoiceController {
  constructor(
    private readonly createHandler: CreateInvoiceHandler,
    private readonly markPaidHandler: MarkInvoicePaidHandler,
    @Inject("InvoiceRepository") private readonly repository: InvoiceRepository,
  ) {}

  @Post()
  async create(
    @Body() body: { amount: number; currency: string; subscriptionId?: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<InvoiceResponse> {
    const command = new CreateInvoiceCommand({
      organizationId: req.user.organizationId,
      amount: body.amount,
      currency: body.currency,
      subscriptionId: body.subscriptionId,
    });
    const result = await this.createHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<InvoiceResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Invoices" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((invoice) => invoice.organizationId.toString() === req.user.organizationId)
      .map((invoice) => toResponse(invoice));
  }

  @Get(":id")
  async findById(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<InvoiceResponse> {
    const invoice = await this.loadAndAssertOwnership(id, req.user);
    return toResponse(invoice);
  }

  @Post(":id/pay")
  async markPaid(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<InvoiceResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const command = new MarkInvoicePaidCommand({ invoiceId: id });
    const result = await this.markPaidHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  private async loadAndAssertOwnership(id: string, user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Invoice" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Invoice "${id}" não encontrada` });
    }
    const invoice = option.getOrElse(null as never);
    if (invoice.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Invoice "${id}" não encontrada` });
    }
    return invoice;
  }
}

function toResponse(invoice: {
  id: { toString(): string };
  organizationId: { toString(): string };
  amount: number;
  currency: string;
  status: string;
  subscriptionId?: { toString(): string };
  createdAt: Date;
  updatedAt: Date;
}): InvoiceResponse {
  return {
    id: invoice.id.toString(),
    organizationId: invoice.organizationId.toString(),
    amount: invoice.amount,
    currency: invoice.currency,
    status: invoice.status,
    subscriptionId: invoice.subscriptionId?.toString(),
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
  };
}
