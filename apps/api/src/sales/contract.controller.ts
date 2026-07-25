import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import {
  ActivateContractCommand,
  ActivateContractHandler,
  TerminateContractCommand,
  TerminateContractHandler,
  GenerateRevenueFromContractCommand,
  GenerateRevenueFromContractHandler,
  type ContractRepository,
  type ContractStatus,
} from "@novaris/sales";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";
import type { RevenueResponse } from "./revenue.controller.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface ContractResponse {
  id: string;
  opportunityId: string;
  quotationId: string;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * ContractController — API do `Contract` (`ADR-0044`), Sales Domain. Não
 * expõe `POST /contracts` diretamente — Contract só nasce via
 * `POST /quotations/:id/generate-contract` (`QuotationController`), nunca
 * criado avulso (mesmo princípio de `AuditEntry` não ter `POST`).
 */
@Controller("contracts")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("sales.contracts.manage")
export class ContractController {
  constructor(
    private readonly activateHandler: ActivateContractHandler,
    private readonly terminateHandler: TerminateContractHandler,
    private readonly generateRevenueHandler: GenerateRevenueFromContractHandler,
    @Inject("ContractRepository") private readonly repository: ContractRepository,
  ) {}

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<ContractResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Contracts" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((contract) => contract.organizationId.toString() === req.user.organizationId)
      .map((contract) => toResponse(contract));
  }

  @Get(":id")
  async findById(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<ContractResponse> {
    const contract = await this.loadAndAssertOwnership(id, req.user);
    return toResponse(contract);
  }

  @Post(":id/activate")
  async activate(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<ContractResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.activateHandler.execute(new ActivateContractCommand({ contractId: id }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Post(":id/terminate")
  async terminate(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<ContractResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.terminateHandler.execute(new TerminateContractCommand({ contractId: id }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  /** Gera um `Revenue` real a partir deste Contract (`ADR-0047`) — falha com 409 se não `active`. */
  @Post(":id/generate-revenue")
  async generateRevenue(
    @Param("id") id: string,
    @Body() body: { amount: number; currency: string; recognizedAt?: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<RevenueResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.generateRevenueHandler.execute(
      new GenerateRevenueFromContractCommand({
        contractId: id,
        amount: body.amount,
        currency: body.currency,
        recognizedAt: body.recognizedAt ? new Date(body.recognizedAt) : undefined,
      }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toRevenueResponse(result.getValue()!);
  }

  private async loadAndAssertOwnership(id: string, user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Contract" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Contract "${id}" não encontrado` });
    }
    const contract = option.getOrElse(null as never);
    if (contract.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Contract "${id}" não encontrado` });
    }
    return contract;
  }
}

function toRevenueResponse(revenue: {
  id: { toString(): string };
  contractId: { toString(): string };
  amount: number;
  currency: string;
  recognizedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}): RevenueResponse {
  return {
    id: revenue.id.toString(),
    contractId: revenue.contractId.toString(),
    amount: revenue.amount,
    currency: revenue.currency,
    recognizedAt: revenue.recognizedAt.toISOString(),
    createdAt: revenue.createdAt.toISOString(),
    updatedAt: revenue.updatedAt.toISOString(),
  };
}

function toResponse(contract: {
  id: { toString(): string };
  opportunityId: { toString(): string };
  quotationId: { toString(): string };
  status: ContractStatus;
  createdAt: Date;
  updatedAt: Date;
}): ContractResponse {
  return {
    id: contract.id.toString(),
    opportunityId: contract.opportunityId.toString(),
    quotationId: contract.quotationId.toString(),
    status: contract.status,
    createdAt: contract.createdAt.toISOString(),
    updatedAt: contract.updatedAt.toISOString(),
  };
}
